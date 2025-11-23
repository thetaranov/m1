
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, X, HelpCircle } from 'lucide-react';
import { askPitmaster } from '../services/geminiService';
import { ChatMessage } from '../types';

interface ChefBotProps {
  visible?: boolean;
  externalIsOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

const ChefBot: React.FC<ChefBotProps> = ({ visible = true, externalIsOpen, onToggle }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Здравствуйте! Я специалист по продукции bbqp. Готов рассказать о характеристиках, режимах работы или помочь с выбором модели.' }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine if we use internal state or external props
  const isControlled = externalIsOpen !== undefined && onToggle !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;
  const setIsOpen = (val: boolean) => {
      if (isControlled) {
          onToggle(val);
      } else {
          setInternalIsOpen(val);
      }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
        scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await askPitmaster(input);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Система временно недоступна. Попробуйте позже.", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div 
      className={`fixed bottom-6 right-6 z-[90] flex flex-col items-end transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
    >
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[90vw] md:w-96 bg-[#0a0a0a]/90 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-fade-in origin-bottom-right ring-1 ring-white/5 max-h-[60vh] md:max-h-96">
          {/* Header */}
          <div className="bg-black/40 backdrop-blur-md p-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white border border-white/10 shadow-md">
                <HelpCircle size={18} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">bbqp Support</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Product Specialist</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20}/>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-black/20">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-orange-600/20 text-white border border-orange-500/20 rounded-tr-sm'
                      : 'bg-white/10 backdrop-blur-sm text-gray-200 border border-white/10 rounded-tl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="bg-white/5 backdrop-blur-sm p-3 rounded-2xl rounded-tl-sm border border-white/10 shadow-sm flex items-center gap-2">
                  <Loader2 className="animate-spin text-white" size={14} />
                  <span className="text-xs text-gray-400">Печатает...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-black/60 backdrop-blur-md border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Задайте вопрос..."
              className="flex-1 bg-white/5 border-transparent rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all placeholder:text-gray-500"
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="p-2.5 bg-orange-600 hover:bg-orange-700 rounded-xl text-white transition-colors disabled:opacity-50 shadow-lg"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button - Hidden on mobile as it is moved to Navigation header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group hidden md:flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/10 text-white px-6 py-4 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all hover:bg-black/80 hover:scale-105 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <span className="font-bold text-sm hidden md:block">
          Поддержка
        </span>
        <MessageSquare size={20} className="text-white" />
      </button>
    </div>
  );
};

export default ChefBot;