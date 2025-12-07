import { ExperienceTemplate, TemplateType } from './types';

export const INITIAL_GREETING = "你好！我是简历狮 🦁，你的专属 AI 简历导师。\n\n我不玩虚的，请直接把你想写进简历的经历一股脑告诉我（例如：“拿过挑战杯二等奖，做过家教，还在学生会当过干事”）。\n\n我会帮你去伪存真、挖掘亮点，最后生成专业的 STAR 简历内容！";

// Asset 1: The Template Library (Now used as "Strategy Guides" for the AI, not hardcoded text)
export const EXPERIENCE_TEMPLATES: Record<TemplateType, ExperienceTemplate> = {
  [TemplateType.COMPETITION]: {
    type: TemplateType.COMPETITION,
    name: "学术/商业比赛",
    topicGuides: [
      { field: 'role', topic: '核心角色与分工' },
      { field: 'action', topic: '关键行动与具体方法' },
      { field: 'difficulty', topic: '遇到的最大困难与解决方案' },
      { field: 'result', topic: '最终量化成果与奖项含金量' },
    ]
  },
  [TemplateType.CLUB]: {
    type: TemplateType.CLUB,
    name: "学生会/社团经历",
    topicGuides: [
      { field: 'role', topic: '职位与团队定位' },
      { field: 'scope', topic: '工作范围与团队规模' },
      { field: 'event', topic: '主导的标志性事件/活动' },
      { field: 'impact', topic: '对组织的实质性贡献/数据提升' },
    ]
  },
  [TemplateType.VOLUNTEER]: {
    type: TemplateType.VOLUNTEER,
    name: "志愿/公益服务",
    topicGuides: [
      { field: 'activity_name', topic: '服务对象与背景' },
      { field: 'duration', topic: '持续时长与投入度' },
      { field: 'action', topic: '具体解决的问题与行动' },
      { field: 'recognition', topic: '外部评价与表彰' },
    ]
  },
  [TemplateType.ACTIVITY]: {
    type: TemplateType.ACTIVITY,
    name: "实习/兼职/文体活动",
    topicGuides: [
      { field: 'role', topic: '具体职责/工种' },
      { field: 'scale', topic: '工作量级/活动规模' },
      { field: 'challenge', topic: '突发挑战或复杂情况处理' },
      { field: 'result', topic: '获得的报酬/评价/软技能提升' },
    ]
  },
  [TemplateType.PROJECT]: {
    type: TemplateType.PROJECT,
    name: "课程/个人项目",
    topicGuides: [
      { field: 'project_name', topic: '项目背景与团队构成' },
      { field: 'tech_stack', topic: '技术栈/工具/理论框架' },
      { field: 'contribution', topic: '核心模块实现细节' },
      { field: 'outcome', topic: '最终产出物与成绩' },
    ]
  },
};