import React from 'react';

interface TypingIndicatorProps {
  text?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ text }) => {
  return (
    <div className="flex w-full mb-4 justify-start flex-col gap-1">
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1.5 h-[46px] w-fit">
        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
      </div>
      {text && (
        <span className="text-xs text-gray-400 ml-2 animate-pulse">{text}</span>
      )}
    </div>
  );
};

export default TypingIndicator;