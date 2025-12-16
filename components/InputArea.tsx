import React, { useState, useRef, useEffect } from 'react';
import { Send, AlignLeft, AlignRight, CornerDownLeft } from 'lucide-react';
import { Direction } from '../types';

interface InputAreaProps {
  onSend: (text: string, direction: Direction) => void;
  isLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');
  const [direction, setDirection] = useState<Direction>('ltr');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustHeight();
  };

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSend(input, direction);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleDirection = () => {
    setDirection(prev => prev === 'ltr' ? 'rtl' : 'ltr');
  };

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-slate-900 border-t border-slate-800 sticky bottom-0 z-10">
      <div className="relative flex flex-col bg-slate-800 rounded-xl border border-slate-700 shadow-lg focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
        
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50 bg-slate-800/50 rounded-t-xl">
           <div className="flex items-center gap-1">
             <button
               onClick={toggleDirection}
               className={`
                 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                 ${direction === 'rtl' 
                   ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' 
                   : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}
               `}
               title={direction === 'rtl' ? "Switch to Left-to-Right" : "Switch to Right-to-Left"}
             >
               {direction === 'rtl' ? (
                 <>
                   <AlignRight size={14} />
                   <span>RTL Active</span>
                 </>
               ) : (
                 <>
                   <AlignLeft size={14} />
                   <span>LTR Active</span>
                 </>
               )}
             </button>
           </div>
           
           <div className="text-xs text-slate-500 font-mono hidden sm:block">
             Shift + Enter for new line
           </div>
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          dir={direction}
          placeholder={direction === 'rtl' ? "הקלד את ההודעה שלך כאן..." : "Type your message here..."}
          className="w-full bg-transparent text-slate-100 placeholder-slate-500 px-4 py-3 resize-none focus:outline-none min-h-[60px] max-h-[200px]"
          rows={1}
        />

        {/* Send Button */}
        <div className="absolute bottom-2 right-2 left-2 flex justify-end pointer-events-none">
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className={`
              pointer-events-auto
              p-2 rounded-lg transition-all duration-200
              ${input.trim() && !isLoading
                ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-500 hover:translate-y-[-1px]' 
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'}
            `}
          >
            {isLoading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
               <Send size={18} />
            )}
          </button>
        </div>
      </div>
      
      <div className="text-center mt-2">
        <p className="text-[10px] text-slate-500">
          Gemini may display inaccurate info, including about people, so double-check its responses.
        </p>
      </div>
    </div>
  );
};