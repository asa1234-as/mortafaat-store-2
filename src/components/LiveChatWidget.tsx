import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../context/StoreContext';
import { MessageSquare, X, Send, MessageCircle, Bot, User, ShieldCheck } from 'lucide-react';

export const LiveChatWidget: React.FC = () => {
  const { isChatOpen, setIsChatOpen, chatMessages, sendChatMessage, settings } = useStore();
  const [inputText, setInputText] = useState('');
  
  // Drag state for the bubble
  const [bubblePos, setBubblePos] = useState<{ x: number; y: number }>({ x: -1, y: -1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; bx: number; by: number } | null>(null);
  const bubbleRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize bubble position
  useEffect(() => {
    if (bubblePos.x === -1) {
      setBubblePos({ x: 20, y: window.innerHeight - 80 });
    }
  }, []);

  // Auto-scroll to bottom when chat opens or new message arrives
  useEffect(() => {
    if (isChatOpen && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isChatOpen, chatMessages]);

  // Drag handlers for the bubble
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
    const newX = Math.max(0, Math.min(window.innerWidth - 56, dragStartRef.current.bx + dx));
    const newY = Math.max(0, Math.min(window.innerHeight - 56, dragStartRef.current.by + dy));
    setBubblePos({ x: newX, y: newY });
  }, [isDragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const dx = Math.abs(e.clientX - dragStartRef.current.x);
    const dy = Math.abs(e.clientY - dragStartRef.current.y);
    
    // If barely moved, it's a click - open chat
    if (dx < 5 && dy < 5) {
      setIsChatOpen(true);
    }
    
    setIsDragging(false);
    dragStartRef.current = null;
  }, [setIsChatOpen]);

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
      {/* Draggable Floating Chat Bubble */}
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
          className="w-12 h-12 rounded-full bg-brand-black text-brand-gold border-2 border-brand-gold shadow-2xl hover:scale-110 active:scale-95 transition-transform flex items-center justify-center relative cursor-grab active:cursor-grabbing select-none"
          title="اسحبني لأي مكان أو اضغط لفتح المحادثة"
        >
          <MessageSquare className="w-5 h-5 text-brand-gold pointer-events-none" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black animate-ping pointer-events-none" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black pointer-events-none" />
        </button>
      )}

      {/* Chat Window */}
      {isChatOpen && (
        <div 
          style={{
            position: 'fixed',
            left: `${Math.min(bubblePos.x, window.innerWidth - 400)}px`,
            bottom: '20px',
            zIndex: 50
          }}
          className="w-[92vw] sm:w-[380px] h-[520px] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-brand-gold/40 flex flex-col overflow-hidden"
        >
          
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
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-zinc-50 dark:bg-zinc-950">
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

            {/* Invisible scroll anchor */}
            <div ref={messagesEndRef} />
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
