'use client';
import { useState, useEffect } from 'react';

export default function ChatBubble({ message, isAI, quickReplies, onQuickReply }) {
  const [isTyping, setIsTyping] = useState(isAI && !message);

  useEffect(() => {
    if (isAI && !message) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  }, [message, isAI]);

  return (
    <div className={`flex w-full ${isAI ? 'justify-start' : 'justify-end'} mb-6 animate-slide-up`}>
      <div 
        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 shadow-lg backdrop-blur-md ${
          isAI 
            ? 'bg-slate-800/80 border border-teal-500/30 rounded-tl-none text-slate-100' 
            : 'bg-gradient-to-br from-indigo-600 to-indigo-800 border border-indigo-400/30 rounded-tr-none text-white'
        }`}
      >
        {isTyping ? (
          <div className="flex gap-1 items-center h-6 px-2">
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <>
            <p className="text-[17px] leading-relaxed font-medium">{message}</p>
            
            {quickReplies && quickReplies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-700/50">
                {quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => onQuickReply(reply)}
                    className="px-4 py-2 bg-slate-700/50 hover:bg-teal-500/20 hover:text-teal-300 border border-slate-600 rounded-xl text-sm transition-colors text-left"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
            
            <div className={`text-[11px] mt-2 opacity-50 ${isAI ? 'text-left' : 'text-right'}`}>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
