import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  AppState, 
  Message, 
  ExperienceTemplate,
  FinalResult,
  CandidateExperience,
  ResumeDirection,
  InterviewSession,
  AnalysisResult,
  Question
} from './types';
import { EXPERIENCE_TEMPLATES, INITIAL_GREETING } from './constants';
import * as GeminiService from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import TypingIndicator from './components/TypingIndicator';
import ResultView from './components/ResultView';

// Logo Component
const LionLogo = () => (
  <svg viewBox="0 0 24 24" className="w-9 h-9 drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Mane - Majestic Sunburst */}
    <path d="M12 1C5.9 1 1 5.9 1 12s4.9 11 11 11 11-4.9 11-11S18.1 1 12 1zm0 20c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9z" className="text-amber-500/20" fill="currentColor"/>
    <path d="M12 2.5L13.2 4.8L15.5 4L16 6.5L18.5 7L18 9.5L20.5 10.8L19 13L20.5 15.2L18 16.5L18.5 19L16 19.5L15.5 22L13.2 21.2L12 23.5L10.8 21.2L8.5 22L8 19.5L5.5 19L6 16.5L4.5 15.2L6 13L4.5 10.8L7 9.5L6.5 7L9 6.5L9.5 4L10.8 4.8L12 2.5Z" className="text-amber-400" fill="currentColor"/>
    
    {/* Ears */}
    <circle cx="7.5" cy="8.5" r="2" className="text-amber-500" fill="currentColor"/>
    <circle cx="16.5" cy="8.5" r="2" className="text-amber-500" fill="currentColor"/>
    <circle cx="7.5" cy="8.5" r="1" className="text-amber-200" fill="currentColor"/>
    <circle cx="16.5" cy="8.5" r="1" className="text-amber-200" fill="currentColor"/>

    {/* Face */}
    <circle cx="12" cy="13.5" r="5.5" className="text-amber-100" fill="currentColor"/>
    
    {/* Eyes */}
    <circle cx="10" cy="12.5" r="0.8" className="text-indigo-900" fill="currentColor"/>
    <circle cx="14" cy="12.5" r="0.8" className="text-indigo-900" fill="currentColor"/>
    
    {/* Nose */}
    <path d="M12 15L11 14H13L12 15Z" className="text-pink-400" fill="currentColor"/>
    
    {/* Mouth */}
    <path d="M12 15V16C12 16 11 17 10 16.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-indigo-900"/>
    <path d="M12 16C12 16 13 17 14 16.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-indigo-900"/>
  </svg>
);

const App: React.FC = () => {
  // --- UI State ---
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: INITIAL_GREETING }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [processingStatusText, setProcessingStatusText] = useState(''); 

  // --- Data State ---
  const [allProjects, setAllProjects] = useState<CandidateExperience[]>([]);
  const [ignoredItems, setIgnoredItems] = useState<{name: string, reason: string}[]>([]);
  const [directions, setDirections] = useState<ResumeDirection[]>([]);
  
  // --- Interview Logic State ---
  const [interviewQueue, setInterviewQueue] = useState<string[]>([]);
  const [completedSessions, setCompletedSessions] = useState<InterviewSession[]>([]);
  
  // Current active interview details
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentTemplate, setCurrentTemplate] = useState<ExperienceTemplate | null>(null);
  
  // DYNAMIC QUESTIONS 
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>({});

  const [finalResult, setFinalResult] = useState<FinalResult | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiProcessing, appState]);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const handleSelectDirection = (direction: ResumeDirection) => {
    setInterviewQueue(direction.projectIds);
    setCompletedSessions([]);
    
    addMessage('user', `我选择：${direction.title}`);
    
    // Start processing queue
    setTimeout(() => {
      processNextInQueue(direction.projectIds, []); 
    }, 500);
  };

  /**
   * Core Logic: Queue Processor with Dynamic Question Generation
   */
  const processNextInQueue = async (queue: string[], completed: InterviewSession[]) => {
    if (queue.length === 0) {
      finishAllInterviews(completed);
      return;
    }

    const [nextId, ...remainingQueue] = queue;
    const project = allProjects.find(p => p.id === nextId);

    if (!project) {
      processNextInQueue(remainingQueue, completed);
      return;
    }

    // Set state for "Preparing"
    setInterviewQueue(remainingQueue);
    setCurrentProjectId(project.id);
    setAppState('PREPARING_QUESTIONS');
    setIsAiProcessing(true);
    setProcessingStatusText(`🦁 正在研究【${project.name}】，为您定制追问策略...`);

    // 1. Generate Custom Questions
    const template = EXPERIENCE_TEMPLATES[project.type];
    setCurrentTemplate(template);
    
    try {
      const customQuestions = await GeminiService.generateCustomQuestions(template, project.name, project.initialInfo);
      
      setCurrentQuestions(customQuestions);
      setQuestionIndex(0);
      setCurrentAnswers(project.initialInfo || {}); // Start with known info
      
      // 2. Transition to Interviewing
      setAppState('INTERVIEWING');
      setIsAiProcessing(false);
      setProcessingStatusText('');

      const realPrefix = completed.length === 0
         ? `我们开始吧。首先是【${project.name}】。`
         : `好的，接下来是【${project.name}】。`;

      addMessage('assistant', `${realPrefix}\n\n${customQuestions[0].text}`);

    } catch (e) {
      console.error(e);
      addMessage('assistant', "抱歉，加载问题时出错了，我们跳过这个项目吧。");
      processNextInQueue(remainingQueue, completed);
    }
  };

  const finishAllInterviews = async (sessions: InterviewSession[]) => {
    setAppState('GENERATING');
    setIsAiProcessing(true);
    setProcessingStatusText("🦁 正在打磨简历措辞并匹配岗位，请稍候...");
    addMessage('assistant', "收到！所有经历都挖掘完了，简历狮正在为您生成最终方案...");

    try {
      const result = await GeminiService.generateResumeContent(sessions);
      setFinalResult(result);
      setAppState('FINISHED');
    } catch (e) {
      console.error(e);
      addMessage('assistant', "生成失败，请重试。");
    } finally {
      setIsAiProcessing(false);
      setProcessingStatusText('');
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isAiProcessing) return;

    const userText = inputValue.trim();
    setInputValue('');
    addMessage('user', userText);
    setIsAiProcessing(true);

    try {
      if (appState === 'IDLE') {
        setAppState('ANALYZING');
        setProcessingStatusText("🦁 简历狮正在分析你的经历，去伪存真...");
        
        const result: AnalysisResult = await GeminiService.analyzeInput(userText);
        
        if (result.projects.length === 0) {
          setIsAiProcessing(false);
          setAppState('IDLE');
          addMessage('assistant', "抱歉，我没有识别出适合写在简历上的具体项目。请尝试列出具体的奖项、实习或活动名称。");
        } else {
          setAllProjects(result.projects);
          setDirections(result.directions);
          setIgnoredItems(result.ignoredItems);
          
          setIsAiProcessing(false);
          setProcessingStatusText('');
          setAppState('SELECTING_DIRECTION');
          
          let reply = `🦁 我提取到了 ${result.projects.length} 个有效经历`;
          if (result.ignoredItems.length > 0) {
            const ignoredNames = result.ignoredItems.map(i => i.name).join('、');
            reply += ` (已自动过滤：${ignoredNames})`;
          }
          reply += `。\n\n请选择一个优化方向，我们开始深挖：`;
          addMessage('assistant', reply);
        }
      } 
      else if (appState === 'INTERVIEWING') {
        if (!currentTemplate || !currentProjectId) return;

        const currentQ = currentQuestions[questionIndex];
        const updatedAnswers = { ...currentAnswers, [currentQ.field]: userText };
        setCurrentAnswers(updatedAnswers);

        const nextIndex = questionIndex + 1;
        if (nextIndex < currentQuestions.length) {
          setQuestionIndex(nextIndex);
          setTimeout(() => {
            setIsAiProcessing(false);
            addMessage('assistant', currentQuestions[nextIndex].text);
          }, 600);
        } else {
          // Finish Current Project
          const project = allProjects.find(p => p.id === currentProjectId)!;
          const newSession: InterviewSession = {
            projectId: project.id,
            projectName: project.name,
            templateType: project.type,
            answers: updatedAnswers
          };
          
          const updatedSessions = [...completedSessions, newSession];
          setCompletedSessions(updatedSessions);
          
          processNextInQueue(interviewQueue, updatedSessions);
        }
      }
    } catch (error) {
      console.error(error);
      setIsAiProcessing(false);
      addMessage('assistant', "系统繁忙，请重试。");
    }
  };

  const handleReset = () => {
    setAppState('IDLE');
    setMessages([{ id: Date.now().toString(), role: 'assistant', content: INITIAL_GREETING }]);
    setAllProjects([]);
    setDirections([]);
    setIgnoredItems([]);
    setInterviewQueue([]);
    setCompletedSessions([]);
    setCurrentAnswers({});
    setFinalResult(null);
    setProcessingStatusText('');
  };

  if (appState === 'FINISHED' && finalResult) {
    return <ResultView result={finalResult} onReset={handleReset} />;
  }

  const getPlaceholder = () => {
    if (appState === 'INTERVIEWING' && currentQuestions.length > 0) return currentQuestions[questionIndex].placeholder;
    if (appState === 'SELECTING_DIRECTION') return "请点击上方卡片选择方向...";
    if (appState === 'PREPARING_QUESTIONS') return "简历狮正在思考...";
    return "例如：我得过挑战杯银奖，还在家教兼职中辅导了5个学生...";
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      <header className="flex-none lion-gradient px-4 py-4 flex items-center justify-between z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-800/50 border border-indigo-400/30 flex items-center justify-center shadow-inner">
             <LionLogo />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg tracking-wide">简历狮</h1>
            <p className="text-[11px] text-indigo-200 font-medium">大学生专属 AI 简历导师</p>
          </div>
        </div>
        {appState !== 'IDLE' && (
           <button onClick={handleReset} className="text-xs text-indigo-200 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-full">重置会话</button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
        <div className="max-w-2xl mx-auto flex flex-col min-h-full justify-end">
           <div className="flex-1"></div> 
           
           {messages.map((msg) => (
             <ChatMessage key={msg.id} message={msg} />
           ))}
           
           {/* DIRECTION SELECTION UI */}
           {appState === 'SELECTING_DIRECTION' && directions.length > 0 && (
             <div className="flex flex-col gap-3 ml-2 mb-4 animate-fade-in w-full max-w-[95%] md:max-w-[85%] self-start">
               {directions.map((dir) => (
                 <button
                   key={dir.id}
                   onClick={() => handleSelectDirection(dir)}
                   className="text-left bg-white p-5 rounded-2xl border border-indigo-50 shadow-sm hover:border-amber-300 hover:shadow-md hover:bg-amber-50/30 transition-all group relative overflow-hidden"
                 >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-800 text-lg group-hover:text-indigo-700 transition-colors">{dir.title}</span>
                      <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-bold">
                         {dir.projectIds.length} 个经历
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 leading-relaxed">{dir.description}</p>
                    <div className="flex flex-wrap gap-2">
                       {dir.projectIds.map(pid => {
                         const p = allProjects.find(ap => ap.id === pid);
                         return p ? (
                           <span key={pid} className="text-[11px] border border-gray-100 text-gray-600 px-2 py-1 rounded-md bg-gray-50 font-medium">
                             {p.name}
                           </span>
                         ) : null;
                       })}
                    </div>
                 </button>
               ))}
               
               {/* Show Ignored Items cleanly */}
               {ignoredItems.length > 0 && (
                 <div className="mt-2 text-xs text-gray-400 px-4 flex gap-2 items-center">
                   <span>🗑️ 已自动忽略:</span>
                   <span>{ignoredItems.map(i => i.name).join('、')}</span>
                 </div>
               )}
             </div>
           )}

           {isAiProcessing && <TypingIndicator text={processingStatusText} />}
           <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="flex-none bg-white border-t border-gray-100 p-4 safe-area-pb shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
        <div className="max-w-2xl mx-auto relative">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex items-end gap-3"
          >
            <div className="flex-1 relative">
                <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={getPlaceholder()}
                disabled={isAiProcessing || appState === 'SELECTING_DIRECTION' || appState === 'PREPARING_QUESTIONS'} 
                className="w-full bg-slate-100 text-gray-900 placeholder-gray-400 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-base disabled:opacity-50 shadow-inner"
                />
            </div>
            
            <button
              type="submit"
              disabled={!inputValue.trim() || isAiProcessing || appState === 'SELECTING_DIRECTION' || appState === 'PREPARING_QUESTIONS'}
              className="lion-gradient text-white rounded-2xl w-14 h-14 flex items-center justify-center shrink-0 hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </form>
          {appState === 'INTERVIEWING' && currentTemplate && currentQuestions.length > 0 && (
            <div className="absolute -top-8 left-0 text-xs text-indigo-400 font-bold px-2 flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
               正在梳理: {currentTemplate.name} ({questionIndex + 1}/{currentQuestions.length})
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default App;