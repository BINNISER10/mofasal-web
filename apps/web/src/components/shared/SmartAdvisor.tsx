'use client';
import React, { useState, useRef, useEffect } from 'react';
import { aiApi } from '@/lib/api/ai';
import { useAppStore } from '@/lib/stores/appStore';
import { MessageSquare, Send, X, Loader2, Sparkles, ChevronDown } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'advisor';
  text: string;
  suggestions?: string[];
  timestamp: Date;
}

export function SmartAdvisor() {
  const { isRTL } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await aiApi.askAdvisor(text.trim());
      const advisorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'advisor',
        text: res.answer,
        suggestions: res.suggestions,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, advisorMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'advisor',
        text: isRTL ? 'عذراً، لم أتمكن من معالجة سؤالك. يرجى المحاولة لاحقاً.' : 'Sorry, I could not process your question. Please try again later.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const quickQuestions = isRTL
    ? ['كيف أقيس مقاسي؟', 'ما أفضل قماش للصيف؟', 'ما الفرق بين الثوب المفصل والجاهز؟']
    : ['How to measure my size?', 'Best fabric for summer?', 'Custom vs ready-made thobe?'];

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-[#00373E] text-white shadow-lg shadow-[#00373E]/30 flex items-center justify-center hover:bg-[#002F35] transition-all hover:scale-110"
        >
          <Sparkles size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,55,62,0.2)] border border-[#D0D6D7]/30 flex flex-col max-h-[600px]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#D0D6D7]/20 bg-gradient-to-l from-[#00373E] to-[#002F35] rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center">
                <Sparkles size={16} className="text-[#00373E]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{isRTL ? 'مستشار مُفصّل' : 'MUFASAL Advisor'}</h3>
                <p className="text-[10px] text-white/60">{isRTL ? 'مساعدك الذكي للخياطة' : 'Your smart tailoring assistant'}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Sparkles size={32} className="text-[#D4AF37] mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#00373E] mb-2">
                  {isRTL ? 'مرحباً! كيف أساعدك؟' : 'Hello! How can I help?'}
                </p>
                <p className="text-xs text-[#735B4D]/60 mb-4">
                  {isRTL ? 'اسألني عن المقاسات، الأقمشة، أو أي شيء عن الخياطة' : 'Ask me about sizes, fabrics, or anything about tailoring'}
                </p>
                <div className="space-y-2">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="block w-full text-right px-3 py-2 rounded-xl bg-[#F2E8D4]/30 text-xs text-[#00373E] hover:bg-[#F2E8D4]/50 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : 'order-1'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-[#00373E] text-white rounded-br-md'
                      : 'bg-[#F2E8D4]/30 text-[#00373E] rounded-bl-md'
                  }`}>
                    {msg.text}
                  </div>
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestion(s)}
                          className="block w-full text-right px-3 py-1.5 rounded-lg bg-white border border-[#D0D6D7]/20 text-xs text-[#00373E] hover:bg-[#F2E8D4]/20 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-2.5 rounded-2xl bg-[#F2E8D4]/30 rounded-bl-md">
                  <Loader2 size={16} className="animate-spin text-[#00373E]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-[#D0D6D7]/20">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRTL ? 'اكتب سؤالك...' : 'Type your question...'}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#D0D6D7]/30 bg-white text-sm text-[#00373E] placeholder-[#735B4D]/40 focus:outline-none focus:ring-2 focus:ring-[#00373E]/20"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-[#00373E] text-white flex items-center justify-center hover:bg-[#002F35] disabled:opacity-50 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
