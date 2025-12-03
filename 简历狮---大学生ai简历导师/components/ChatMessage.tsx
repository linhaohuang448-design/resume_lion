import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const LionAvatar = () => (
  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-sm border border-indigo-100 shrink-0 mt-1">
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
       {/* Mane - Majestic */}
       <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" className="text-amber-500" fill="currentColor" opacity="0.3"/>
       <path d="M12 2.5L13.2 4.8L15.5 4L16 6.5L18.5 7L18 9.5L20.5 10.8L19 13L20.5 15.2L18 16.5L18.5 19L16 19.5L15.5 22L13.2 21.2L12 23.5L10.8 21.2L8.5 22L8 19.5L5.5 19L6 16.5L4.5 15.2L6 13L4.5 10.8L7 9.5L6.5 7L9 6.5L9.5 4L10.8 4.8L12 2.5Z" className="text-amber-400" fill="currentColor"/>
       
       {/* Ears */}
       <circle cx="7.5" cy="8.5" r="2" className="text-amber-500" fill="currentColor"/>
       <circle cx="16.5" cy="8.5" r="2" className="text-amber-500" fill="currentColor"/>
       <circle cx="7.5" cy="8.5" r="1" className="text-amber-200" fill="currentColor"/>
       <circle cx="16.5" cy="8.5" r="1" className="text-amber-200" fill="currentColor"/>

       {/* Face Background */}
       <circle cx="12" cy="13.5" r="5.5" className="text-amber-300" fill="currentColor" />

       {/* Eyes */}
       <circle cx="10" cy="12.5" r="0.8" className="text-indigo-900" fill="currentColor" />
       <circle cx="14" cy="12.5" r="0.8" className="text-indigo-900" fill="currentColor" />
       
       {/* Nose/Mouth */}
       <path d="M11 15C11 15 11.5 15.5 12 15.5C12.5 15.5 13 15 13 15" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-indigo-900"/>
    </svg>
  </div>
);

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system'; 
  const isAssistant = message.role === 'assistant';

  if (isSystem) return null;

  return (
    <div className={`flex w-full mb-5 ${isUser ? 'justify-end' : 'justify-start'} gap-3`}>
      {isAssistant && <LionAvatar />}
      
      <div
        className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 text-[15px] sm:text-base leading-relaxed shadow-sm ${
          isUser
            ? 'bg-indigo-600 text-white rounded-br-sm'
            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
        }`}
      >
        {isAssistant && (
          <div className="text-[10px] font-bold text-indigo-400 mb-1 tracking-wide uppercase flex items-center gap-1">
             <span>简历狮 AI</span>
          </div>
        )}
        
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  );
};

export default ChatMessage;