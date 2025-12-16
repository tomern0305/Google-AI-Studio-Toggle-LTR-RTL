import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Direction } from '../types';
import { Bot, User, Copy, Check } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

// Simple heuristic to detect if text is predominantly Hebrew
const isHebrew = (text: string): boolean => {
  const hebrewRegex = /[\u0590-\u05FF]/;
  return hebrewRegex.test(text);
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.role === 'user';
  
  // Determine direction: use explicit override if present, otherwise auto-detect
  const direction: Direction = message.direction || (isHebrew(message.content) ? 'rtl' : 'ltr');
  const textAlign = direction === 'rtl' ? 'text-right' : 'text-left';
  
  // For RTL layouts, we might want the bubble on the other side, or keep standard chat alignment
  // Standard chat: User right, Bot left.
  // Content alignment depends on language.

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`
          flex max-w-[85%] md:max-w-[75%] 
          ${isUser ? 'flex-row-reverse' : 'flex-row'} 
          gap-3
        `}
      >
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUser ? 'bg-blue-600' : 'bg-emerald-600'}
        `}>
          {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
        </div>

        {/* Bubble */}
        <div 
          className={`
            group relative p-4 rounded-2xl shadow-sm
            ${isUser 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'}
          `}
        >
          {/* Content */}
          <div 
            className={`prose prose-invert max-w-none break-words leading-relaxed ${textAlign}`}
            dir={direction}
          >
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {/* Actions */}
          <div className={`
            absolute -bottom-6 ${isUser ? 'right-0' : 'left-0'} 
            opacity-0 group-hover:opacity-100 transition-opacity flex gap-2
          `}>
             <button 
              onClick={handleCopy}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Copy text"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};