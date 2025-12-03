import { GoogleGenAI, Type } from "@google/genai";
import { TemplateType, FinalResult, AnalysisResult, InterviewSession, Question, ExperienceTemplate } from "../types";

const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing via process.env.API_KEY");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-build' });

/**
 * Step 1: Analyze user input (Advanced)
 */
export const analyzeInput = async (userInput: string): Promise<AnalysisResult> => {
  const model = "gemini-2.5-flash";
  
  const systemPrompt = `你是一名资深的「AI 简历分析师」。你的任务是：

1. 分析用户输入的一大段中文内容（Brain Dump）
2. 清洗文本，明确哪些内容可写进简历，哪些必须丢弃（ignoredItems）
3. 拆分出多个独立的可用项目（valid projects）
4. 严格为每个项目分类（类别定义见下）
5. 从每条项目中提取 initialInfo（避免后续冗余提问）
6. 根据提取出的项目自动合成 1～3 个简历方向（Resume Directions）
7. 所有输出必须严格符合 response_schema（根节点为 OBJECT）

【项目分类规则（必须严格遵守）】
COMPETITION：比赛、竞赛、辩论赛、演讲赛、挑战赛、黑客松
CLUB：学生会、社团、班委、兴趣小组、校园组织
VOLUNTEER：无报酬的公益活动（注意：有补贴/工资的家教 ≠ 志愿）
ACTIVITY：兼职、家教（无论是否有偿）、副业、短期活动、勤工助学、自媒体创作、打工
PROJECT：科研、课程设计、软件项目、调研项目、创新创业项目

【垃圾过滤规则（ignoredItems）】
以下内容必须归为 ignoredItems：
- 纯娱乐（打游戏、追剧、散步、旅游、朋友聚会）
- 纯情绪/描述（我很迷茫、我很焦虑、我很感兴趣）
- 无有效产出的行为（刷微博、小红书粉丝群）
- 不具备可量化价值的零散事件（帮同学打印、搬快递）

【initialInfo 规则】
从项目文本中抽取以下信息（如有）：
- role（队长、负责人、助教、发起人…）
- result（一二等奖、入围、优秀奖、Top10%…）
- scale（参与人数）
- timeframe（持续多久）
- pay（是否有报酬：true/false）

【方向生成 Resume Directions】
方向必须符合：
- 每个方向包含 1–4 个项目
- 方向名称需概括该方向能力（如：数据分析方向 / 活动组织方向）
- 附一句话说明方向适合申请哪些岗位

务必确保：
- 全部输出必须符合 JSON Schema
- 根节点为 OBJECT，不得直接返回数组`;

  const userPrompt = `请分析以下用户输入的中文内容，并执行以下任务：

1）过滤垃圾内容 → ignoredItems
2）拆分可写进简历的项目 → projects
3）为每个项目分类 → category
4）抽取项目初始信息 → initialInfo
5）生成 1～3 个方向 → directions

用户输入如下：

${userInput}

请按 response_schema 返回 JSON。`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    enum: ["COMPETITION", "CLUB", "VOLUNTEER", "ACTIVITY", "PROJECT"]
                  },
                  initialInfo: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            key: { type: Type.STRING },
                            value: { type: Type.STRING }
                        }
                    },
                    nullable: true,
                    description: "Details already provided by user"
                  }
                }
              }
            },
            ignoredItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  reason: { type: Type.STRING, description: "Why it was ignored" }
                }
              }
            },
            directions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  projectIds: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || "{}");
    
    // Map the array-based initialInfo back to a Record object for easier use in frontend
    const projects = (json.projects || []).map((p: any) => {
      const infoMap: Record<string, string> = {};
      if (Array.isArray(p.initialInfo)) {
        p.initialInfo.forEach((item: any) => {
          if (item.key && item.value) {
            infoMap[item.key] = item.value;
          }
        });
      }
      return {
        ...p,
        initialInfo: infoMap
      };
    });

    return {
      projects: projects,
      directions: json.directions || [],
      ignoredItems: json.ignoredItems || []
    };

  } catch (error) {
    console.error("Analysis error:", error);
    return {
      projects: [],
      directions: [],
      ignoredItems: []
    };
  }
};

/**
 * Step 1.5: Dynamic Question Generation
 */
export const generateCustomQuestions = async (
  template: ExperienceTemplate, 
  projectName: string, 
  initialInfo: Record<string, string>
): Promise<Question[]> => {
  const model = "gemini-2.5-flash";

  const systemPrompt = `你是一名专业的「AI 简历追问教练」。

你的任务是为一个具体项目生成 3～5 个深度、高质量、不重复的问题，以便进一步挖掘可写进简历的内容。

【必须遵守的规则】

1. 所有问题必须完全基于该项目的语境（比赛/课程/兼职/志愿等）

2. 禁止提问 initialInfo 中已经给出的信息：
   - 如果已提供 result（如二等奖），禁止再问“成绩是什么？”
   - 如果已提供 role（如队长），禁止再问“你担任什么角色？”
   - 如果已提供 scale，禁止再问“有几个人参与？”
   - 如果已提供 pay，禁止再问“是否有报酬？”

3. 替代逻辑：
   - result 已知 → 询问“含金量、参赛人数、难度、对手情况”
   - role 已知 → 深问“你的职责、具体动作、难点”
   - scale 已知 → 深问“你具体协调了哪些资源，人/物/流程多少？”

4. 每道问题必须附带一个 placeholder 示例（非常具体，辅助用户表达）

5. 问题应基于 STAR 原则（Situation, Task, Action, Result）

6. 必须返回 JSON 对象，根字段为：
{
  "questions": [
    { "text": "...", "placeholder": "..." }
  ]
}`;

  const userPrompt = `请为以下项目生成 3～5 个高质量追问：

项目名称：${projectName}
类型：${template.name}
初始信息 initialInfo：${JSON.stringify(initialInfo)}

要求：
- 问题必须与项目高度相关
- 禁止重复与 initialInfo 内容
- 每个问题提供一个清晰、中文的示例 placeholder
- 按 JSON 格式返回`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  field: { type: Type.STRING },
                  text: { type: Type.STRING },
                  placeholder: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || "{}");
    return json.questions || [];
  } catch (e) {
    console.error("Question Gen Error", e);
    return template.topicGuides.map((guide, idx) => ({
      id: `fallback-${idx}`,
      field: guide.field,
      text: `关于${guide.topic}，能具体说说吗？`,
      placeholder: "例如：具体做了什么、数据如何..."
    }));
  }
};

/**
 * Step 2: Generate Resume Bullets
 */
export const generateResumeContent = async (sessions: InterviewSession[]): Promise<FinalResult> => {
  const model = "gemini-2.5-flash";
  const contextString = JSON.stringify(sessions, null, 2);

  const systemPrompt = `你是一名资深「职业简历写作专家」。

你的任务是根据多个项目的深度问答内容，生成：

1. 中文 STAR 风格的简历 Bullet Points
2. 每个项目单独输出一段内容
3. 最终输出适合该同学的岗位推荐及原因

【Bullet 生成规则】
- 必须按项目分组输出
- 每个项目 2～4 条 bullet 即可
- 每条 bullet 遵循“动作动词 + 方法/过程 + 数据/结果”
- 动词建议使用：负责、参与、协调、优化、分析、设计、实现、调研、推进
- 若用户未提供数字，可根据语境合理估算区间（如 “约50人”），但不得虚构夸张不合理的数据
- 所有输出必须自然、专业、适合中国大学生简历

【岗位推荐规则】
- 根据多个项目的能力特征（组织、技术、活动、数据、教学…）
- 输出 3–5 个常见实习岗位（如：运营助理、新媒体、产品实习生、数据助理、教学助理等）
- 每个岗位必须包含一条“推荐原因”（基于项目能力抽象）

必须按 response_schema 返回 JSON。`;

  const userPrompt = `请根据以下多个项目的 Interview Sessions，生成最终的中文简历内容。

InterviewSessions（含 initialInfo + 动态问答）如下：

${contextString}

请输出：
1. resumeSections：按项目分组的 bullet points
2. recommendedJobs：适合申请的岗位 + 推荐理由

请严格按 JSON Schema 返回。`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resumeSections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  projectName: { type: Type.STRING },
                  bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            recommendedJobs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  matchReason: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    return { resumeSections: [], recommendedJobs: [] };
  }
};