import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MessageSquare, X, Send, MessageCircle, Bot, User, ShieldCheck, MoveHorizontal } from 'lucide-react';

export const LiveChatWidget: React.FC = () => {
  const { isChatOpen, setIsChatOpen, chatMessages, sendChatMessage, settings } = useStore();
  const [inputText, setInputText] = useState('');
  const [isLeftPosition, setIsLeftPosition] = useState(true);

  const quickQuestions = [
    'ما هي مدة وتكلفة الشحن؟',
    'هل متاح فحص ومعاينة المنتج قبل الدفع؟',
    'ما هي العروض والخصومات المتاحة اليوم؟'
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
      {/* Sleek, Modern, Compact Floating Chat Bubble with Position Toggle */}
      {!isChatOpen && (
        <div className={`fixed bottom-5 z-40 flex items-center gap-1.5 ${isLeftPosition ? 'left-5 flex-row' : 'right-5 flex-row-reverse'}`}>
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-12 h-12 rounded-full bg-brand-black text-brand-gold border-2 border-brand-gold shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center relative group"
            title="محادثة مباشرة مع خدمة العملاء"
          >
            <MessageSquare className="w-5 h-5 text-brand-gold group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black" />
          </button>

          {/* Quick Position Switcher (Left/Right) */}
          <button
            onClick={() => setIsLeftPosition(!isLeftPosition)}
            className="w-6 h-6 rounded-full bg-zinc-800/80 hover:bg-black text-gray-300 hover:text-brand-gold flex items-center justify-center transition-colors text-[10px] shadow"
            title="نقل مكان أيقونة الشات إلى الجهة المقابلة"
          >
            <MoveHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isChatOpen && (
        <div className={`fixed bottom-5 z-50 w-[92vw] sm:w-[380px] h-[520px] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-brand-gold/40 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 ${isLeftPosition ? 'left-5' : 'right-5'}`}>
          
          {/* Header */}
          <div className="p-3.5 bg-brand-black text-white flex items-center justify-between border-b border-brand-gold/30">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full bg-brand-gold text-brand-black flex items-center justify-center font-bold text-xs">
                <Bot className="w-4 h-4" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-brand-black" />
              </div>
              <div>
                <h4 className="font-bold text-xs leading-none">مساعد مرتفعات ستور الذكي</h4>
                <span className="text-[10px] text-emerald-400 font-semibold">متصل ومربوط بالإدارة للرد الفوري</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsLeftPosition(!isLeftPosition)}
                className="p-1 rounded text-gray-400 hover:text-white"
                title="نقل الشات إلى الجهة المقابلة"
              >
                <MoveHorizontal className="w-3.5 h-3.5" />
              </button>
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

          {/* Quick WhatsApp Link Banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-[11px]">
            <span className="text-emerald-900 dark:text-emerald-300 font-medium">واتساب مباشر مع الإدارة:</span>
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{settings.phone}</span>
            </a>
          </div>

          {/* Messages Box */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-zinc-50 dark:bg-zinc-950">
            {chatMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isSupport = msg.sender === 'support';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                    isUser ? 'bg-brand-gold text-black font-bold' : 
                    isSupport ? 'bg-emerald-600 text-white font-bold' : 
                    'bg-brand-black text-brand-gold'
                  }`}>
                    {isUser ? <User className="w-3.5 h-3.5" /> : 
                     isSupport ? <ShieldCheck className="w-3.5 h-3.5" /> : 
                     <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div className={`max-w-[78%] rounded-2xl p-2.5 text-xs shadow-xs ${
                    isUser
                      ? 'bg-brand-black text-white rounded-tl-none'
                      : isSupport
                      ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 rounded-tr-none font-medium'
                      : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-zinc-700 rounded-tr-none'
                  }`}>
                    {msg.senderName && !isUser && (
                      <span className={`text-[10px] font-bold block mb-0.5 ${isSupport ? 'text-emerald-700 dark:text-emerald-300' : 'text-brand-goldDark'}`}>
                        {msg.senderName}
                      </span>
                    )}
                    <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                    <span className={`text-[9px] block text-left mt-1 text-gray-400`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Quick Suggestions */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-gray-500 block mb-1">أسئلة يمكنك الضغط عليها:</span>
              <div className="flex flex-col gap-1">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuestion(q)}
                    className="text-right text-[11px] p-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 hover:border-brand-gold text-gray-700 dark:text-gray-200 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-2.5 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 flex gap-2">
            <input
              type="text"
              placeholder="اكتب استفسارك وسيرد عليك البوت أو الإدارة فوراً..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-brand-gold focus:outline-none"
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
