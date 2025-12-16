import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, Direction, GeminiModel } from './types';
import { geminiService } from './services/geminiService';
import { ChatMessage } from './components/ChatMessage';
import { InputArea } from './components/InputArea';
import { Settings, Eraser, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<string>(GeminiModel.FLASH);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string, direction: Direction) => {
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      direction: direction
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const responseId = uuidv4();
      let responseContent = '';
      
      // Initialize placeholder for streaming response
      setMessages(prev => [
        ...prev,
        {
          id: responseId,
          role: 'model',
          content: '',
          timestamp: Date.now()
        }
      ]);

      const stream = geminiService.sendMessageStream(text);
      
      for await (const chunk of stream) {
        responseContent += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === responseId 
              ? { ...msg, content: responseContent }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Failed to send message", error);
      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          role: 'model',
          content: "Sorry, I encountered an error while processing your request. Please try again.",
          timestamp: Date.now(),
          direction: 'ltr'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    geminiService.resetChat();
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    geminiService.setModel(newModel);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* Header */}
      <header className="flex-shrink-0 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md z-20">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="text-white" size={18} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Gemini Studio</h1>
              <p className="text-xs text-slate-400">Bidirectional Support (LTR/RTL)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select 
              value={model}
              onChange={(e) => handleModelChange(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={GeminiModel.FLASH}>Gemini 2.5 Flash</option>
              <option value={GeminiModel.PRO}>Gemini 3 Pro</option>
            </select>
            
            <button 
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Clear Chat"
            >
              <Eraser size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-slate-800">
                <Sparkles className="text-blue-500" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-200 mb-2">Welcome to Gemini Studio</h2>
              <p className="text-slate-400 max-w-md mb-8">
                A specialized client for bilingual workflows. Toggle between Hebrew (RTL) and English (LTR) instantly in the input area.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg w-full">
                <button 
                  onClick={() => handleSend("Can you explain Quantum Computing in simple terms?", 'ltr')}
                  className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all hover:border-blue-500/30 group"
                >
                  <span className="text-sm font-medium text-slate-300 group-hover:text-blue-400 block mb-1">English Example</span>
                  <span className="text-xs text-slate-500">Explain Quantum Computing...</span>
                </button>
                <button 
                  onClick={() => handleSend("הסבר לי איך פועלת בינה מלאכותית בקצרה", 'rtl')}
                  dir="rtl"
                  className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-right transition-all hover:border-blue-500/30 group"
                >
                  <span className="text-sm font-medium text-slate-300 group-hover:text-blue-400 block mb-1">דוגמה בעברית</span>
                  <span className="text-xs text-slate-500">הסבר על בינה מלאכותית...</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <InputArea onSend={handleSend} isLoading={isLoading} />
    </div>
  );
};

export default App;