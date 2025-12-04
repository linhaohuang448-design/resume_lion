import React from 'react';
import { FinalResult } from '../types';

interface ResultViewProps {
  result: FinalResult;
  onReset: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ result, onReset }) => {
  const allBullets = result.resumeSections.flatMap(s => s.bullets).join('\n');

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto no-scrollbar pb-8 animate-fade-in">
      {/* Brand Header */}
      <div className="lion-gradient p-8 text-white text-center rounded-b-[2.5rem] shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]"></div>
        <div className="relative z-10">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
             <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Mane */}
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
          </div>
          <h2 className="text-2xl font-bold mb-2 tracking-tight">简历狮已完成优化</h2>
          <p className="opacity-90 text-indigo-100 text-sm">您的经历已转化为职场专业语言</p>
        </div>
      </div>

      <div className="px-4 space-y-6 max-w-2xl mx-auto w-full">
        {/* Bullet Points Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-slate-50/50 px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <span className="text-amber-500">✨</span>
              简历内容 (STAR法则)
            </h3>
            <button 
              onClick={() => navigator.clipboard.writeText(allBullets)}
              className="text-xs text-indigo-600 font-bold bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
            >
              复制全部
            </button>
          </div>
          
          <div className="p-0">
            {result.resumeSections.map((section, idx) => (
              <div key={idx} className={`p-6 ${idx !== 0 ? 'border-t border-gray-50' : ''}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                  <h4 className="font-bold text-gray-800 text-sm">
                    {section.projectName}
                  </h4>
                </div>
                <ul className="space-y-4">
                  {section.bullets.map((point, i) => (
                    <li key={i} className="flex gap-3 text-gray-700 leading-relaxed text-[15px] group">
                      <span className="text-indigo-400 shrink-0 mt-1.5 text-xs">●</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Job Recommendations Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-slate-50/50 px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <span className="text-amber-500">🎯</span>
              推荐岗位方向
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {result.recommendedJobs.map((job, index) => (
              <div key={index} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-start gap-1 md:gap-4">
                <div className="font-bold text-indigo-900 text-sm md:text-base shrink-0 md:w-1/3">{job.title}</div>
                <div className="text-sm text-gray-500 leading-relaxed">{job.matchReason}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onReset}
          className="w-full py-4 bg-white border border-gray-200 text-gray-500 font-semibold rounded-2xl hover:bg-gray-50 hover:text-indigo-600 transition-all shadow-sm mb-10 text-sm"
        >
          🦁 开始新的咨询
        </button>
      </div>
    </div>
  );
};

export default ResultView;