import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  MessageSquare, 
  X, 
  Send, 
  MessageCircle, 
  Bot, 
  User, 
  ShieldCheck,
  Minus,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { t } from '../i18n';

export const LiveChatWidget: React.FC = () => {
  const { isChatOpen, setIsChatOpen, chatMessages, sendChatMessage, settings } = useStore();
  const [inputText, setInputText] = useState('');
  const [chatMode, setChatMode] = useState<'normal' | 'expanded'>('normal');
  
  // Position for the floating bubble
  const [bubblePos, setBubblePos] = useState<{ x: number; y: number }>({ x: -1, y: -1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; bx: number; by: number } | null>(null);
  const bubbleRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize bubble position safely
  useEffect(() => {
    if (bubblePos.x === -1) {
      const initialX = Math.max(16, Math.min(window.innerWidth - 68, 20));
      const initialY = Math.max(16, window.innerHeight - 84);
      setBubblePos({ x: initialX, y: initialY });
    }
  }, [bubblePos.x]);

  // Auto-scroll to bottom when chat opens or new message arrives
  useEffect(() => {
    if (isChatOpen && messagesEndRef.current) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isChatOpen, chatMessages, chatMode]);

  // Drag handlers for the floating bubble
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      bx: bubblePos.x,
      by: bubblePos.y
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [bubblePos]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const newX = Math.max(10, Math.min(window.innerWidth - 60, dragStartRef.current.bx + dx));
    const newY = Math.max(10, Math.min(window.innerHeight - 60, dragStartRef.current.by + dy));
    setBubblePos({ x: newX, y: newY });
  }, [isDragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const dx = Math.abs(e.clientX - dragStartRef.current.x);
    const dy = Math.abs(e.clientY - dragStartRef.current.y);
    
    // If click or tap without drag, open chat
    if (dx < 6 && dy < 6) {
      setIsChatOpen(true);
    }
    
    setIsDragging(false);
    dragStartRef.current = null;
  }, [setIsChatOpen]);

  const quickQuestions = [
    t("ما هي مدة وتكلفة الشحن؟"),
    t("هل متاح فحص ومعاينة المنتج قبل الدفع؟"),
    t("ما هي العروض والخصومات المتاحة اليوم؟")
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

  // Dynamic dimensions based on screen and mode
  const getWindowDimensions = () => {
    if (chatMode === 'expanded') {
      return 'w-[94vw] sm:w-[460px] h-[78vh] sm:h-[560px]';
    }
    // Normal / Mobile compact mode: smaller height and width for compact phones
    return 'w-[92vw] sm:w-[350px] h-[410px] sm:h-[480px]';
  };

  return (
    <>
      {/* 1. Minimized Floating Assistant Bubble */}
      {!isChatOpen && (
        <button
          ref={bubbleRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{
            position: 'fixed',
            left: `${bubblePos.x}px`,
            top: `${bubblePos.y}px`,
            zIndex: 40,
            touchAction: 'none'
          }}
          className="w-12 h-12 rounded-full bg-black text-brand-gold border-2 border-brand-gold shadow-2xl hover:scale-110 active:scale-95 transition-transform flex items-center justify-center relative cursor-grab active:cursor-grabbing select-none"
          title={t("مساعد مرتفعات الذكي - اضغط لفتح المحادثة")}
          aria-label={t("فتح المساعد الذكي")}
        >
          <Bot className="w-6 h-6 text-brand-gold pointer-events-none" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black animate-ping pointer-events-none" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black pointer-events-none" />
        </button>
      )}

      {/* 2. Chat Window with Minimize / Maximize / Close controls */}
      {isChatOpen && (
        <div 
          style={{
            position: 'fixed',
            right: window.innerWidth > 640 ? '20px' : 'auto',
            left: window.innerWidth > 640 ? 'auto' : '4vw',
            bottom: '16px',
            zIndex: 50
          }}
          className={`${getWindowDimensions()} bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border-2 border-brand-gold/40 flex flex-col overflow-hidden transition-all duration-200`}
        >
          
          {/* Header */}
          <div className="p-3 bg-brand-black text-white flex items-center justify-between border-b border-brand-gold/30">
            <div className="flex items-center gap-2">
              <div className="relative w-7 h-7 rounded-full bg-brand-gold text-brand-black flex items-center justify-center font-bold text-xs flex-shrink-0">
                <Bot className="w-4 h-4" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-brand-black" />
              </div>
              <div>
                <h4 className="font-bold text-xs leading-none text-white">{t("مساعد مرتفعات الذكي")}</h4>
                <span className="text-[10px] text-emerald-400 font-semibold">{t("متصل للرد الفوري")}</span>
              </div>
            </div>

            {/* Window Controls: WhatsApp + Minimize + Maximize + Close */}
            <div className="flex items-center gap-1">
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded-lg hover:bg-white/10 text-emerald-400"
                title={t("واتساب")}
              >
                <MessageCircle className="w-4 h-4" />
              </a>

              {/* Minimize to Floating Icon */}
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white"
                title={t("تصغير")}
                aria-label={t("تصغير النافذة")}
              >
                <Minus className="w-4 h-4" />
              </button>

              {/* Toggle Maximize / Compact Mode */}
              <button
                type="button"
                onClick={() => setChatMode(prev => prev === 'normal' ? 'expanded' : 'normal')}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white hidden sm:block"
                title={chatMode === 'normal' ? t("تكبير") : t("استعادة الحجم")}
                aria-label={t("تبديل الحجم")}
              >
                {chatMode === 'normal' ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded-lg hover:bg-red-600/30 text-gray-300 hover:text-red-400"
                title={t("إغلاق")}
                aria-label={t("إغلاق المحادثة")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* WhatsApp Direct Sub-banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-[10px]">
            <span className="text-emerald-900 dark:text-emerald-300 font-medium">{t("واتساب مباشر مع الإدارة:")}</span>
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3" />
              <span>{settings.phone}</span>
            </a>
          </div>

          {/* Messages Container */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-zinc-50 dark:bg-zinc-950">
            {chatMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isSupport = msg.sender === 'support';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                    isUser ? 'bg-brand-gold text-black font-bold' : 
                    isSupport ? 'bg-emerald-600 text-white font-bold' : 
                    'bg-brand-black text-brand-gold'
                  }`}>
                    {isUser ? <User className="w-3 h-3" /> : 
                     isSupport ? <ShieldCheck className="w-3 h-3" /> : 
                     <Bot className="w-3 h-3" />}
                  </div>

                  <div className={`max-w-[80%] rounded-2xl p-2 text-xs shadow-xs ${
                    isUser
                      ? 'bg-brand-black text-white rounded-tl-none'
                      : isSupport
                      ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 rounded-tr-none font-medium'
                      : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-zinc-700 rounded-tr-none'
                  }`}>
                    {msg.senderName && !isUser && (
                      <span className={`text-[10px] font-bold block mb-0.5 ${isSupport ? 'text-emerald-700 dark:text-emerald-300' : 'text-brand-goldDark'}`}>
                        {t(msg.senderName)}
                      </span>
                    )}
                    <p className="leading-relaxed whitespace-pre-line text-[11px]">{t(msg.text)}</p>
                    <span className="text-[9px] block text-end mt-0.5 text-gray-400">
                      {t(msg.time)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Quick Clickable Suggestions */}
            <div className="pt-1.5">
              <span className="text-[10px] font-bold text-gray-500 block mb-1">{t("أسئلة سريعة:")}</span>
              <div className="flex flex-col gap-1">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickQuestion(q)}
                    className="text-start text-[10px] py-1.5 px-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 hover:border-brand-gold text-gray-700 dark:text-gray-200 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Anchor for auto scroll */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-2 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 flex gap-1.5">
            <input
              type="text"
              placeholder={t("اكتب استفسارك هنا...")}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-brand-gold focus:outline-none"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-brand-black text-brand-gold hover:bg-brand-gold hover:text-black transition-colors"
              title={t("إرسال")}
              aria-label={t("إرسال الرسالة")}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
