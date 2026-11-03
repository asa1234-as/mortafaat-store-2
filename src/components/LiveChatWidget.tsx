import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MessageSquare, X, Send, MessageCircle, Bot, User, Clock } from 'lucide-react';

export const LiveChatWidget: React.FC = () => {
  const { isChatOpen, setIsChatOpen, chatMessages, sendChatMessage, settings } = useStore();
  const [inputText, setInputText] = useState('');

  const quickQuestions = [
    'ما هي مدة التوصيل والمحافظات المتاحة؟',
    'هل متاح فحص ومعاينة المنتج قبل الدفع؟',
    'ما هي طرق الدفع المتاحة في المتجر؟'
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText);
    setInputText('');
  };

  const handleQuickQuestion = (q: string) => {
    sendChatMessage(q);
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-5 left-5 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-brand-black text-brand-gold border-2 border-brand-gold shadow-2xl hover:scale-105 transition-all group"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          </div>
          <span className="text-xs font-black text-white group-hover:text-brand-gold transition-colors">
            شات خدمة العملاء
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-5 left-5 z-50 w-[92vw] sm:w-[380px] h-[520px] bg-white rounded-3xl shadow-2xl border border-brand-gold/40 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="p-3.5 bg-brand-black text-white flex items-center justify-between border-b border-brand-gold/30">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full bg-brand-gold text-brand-black flex items-center justify-center font-bold text-xs">
                <Bot className="w-4 h-4" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-brand-black" />
              </div>
              <div>
                <h4 className="font-bold text-xs leading-none">فريق دعم مرتفعات ستور</h4>
                <span className="text-[10px] text-emerald-400 font-semibold">متصل الآن لمساعدتك</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-full hover:bg-white/10 text-emerald-400"
                title="محادثة واتساب مباشرة"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick WhatsApp Banner */}
          <div className="bg-emerald-50 px-3 py-1.5 border-b border-emerald-200 flex items-center justify-between text-[11px]">
            <span className="text-emerald-900 font-medium">للرد السريع والفوري في ثوانٍ:</span>
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>واتساب مباشر</span>
            </a>
          </div>

          {/* Messages Box */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-zinc-50">
            {chatMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                    isUser ? 'bg-brand-gold text-black font-bold' : 'bg-brand-black text-brand-gold'
                  }`}>
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div className={`max-w-[75%] rounded-2xl p-2.5 text-xs shadow-xs ${
                    isUser
                      ? 'bg-brand-black text-white rounded-tl-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-tr-none'
                  }`}>
                    <p className="leading-relaxed">{msg.text}</p>
                    <span className={`text-[9px] block text-left mt-1 ${isUser ? 'text-gray-400' : 'text-gray-400'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Quick Suggestions */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-gray-500 block mb-1">أسئلة شائعة:</span>
              <div className="flex flex-col gap-1">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuestion(q)}
                    className="text-right text-[11px] p-2 rounded-xl bg-white hover:bg-amber-50 border border-gray-200 hover:border-brand-gold text-gray-700 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-gray-200 flex gap-2">
            <input
              type="text"
              placeholder="اكتب استفسارك هنا..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-brand-black text-brand-gold hover:bg-brand-gold hover:text-black transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
