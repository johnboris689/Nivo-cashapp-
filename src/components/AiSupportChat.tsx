import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  MessageSquare,
  Headphones,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  User,
  AlertCircle,
  ChevronRight,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { getCachedSettings, fetchMasterSettings } from '../services/settingsService';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  requiresHumanEscalation?: boolean;
  whatsappLink?: string;
  suggestedActions?: Array<{ label: string; action: string }>;
  isError?: boolean;
}

interface AiSupportChatProps {
  mode?: 'embedded' | 'floating_modal';
  onClose?: () => void;
  onBack?: () => void;
}

export default function AiSupportChat({ mode = 'embedded', onClose, onBack }: AiSupportChatProps) {
  const [settings, setSettings] = useState(getCachedSettings());
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const brandName = settings.websiteName || 'Nevo';
  const whatsappLink = settings.whatsappLink || settings.bpcWhatsappLink || 'https://wa.me/2349162845073';
  const supportEmail = settings.supportEmail || 'support@nevo.app';

  // Initial welcome greeting
  const initialGreeting: ChatMessage = {
    id: 'msg-welcome-1',
    sender: 'assistant',
    text: `Hello 👋 Welcome to ${brandName} Support! I am ${brandName} Assistant, your 24/7 automated fintech guide.\n\nHow can I help you with your account, deposits, bank transfers, or bill settlements today?`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestedActions: [
      { label: '💳 How to deposit funds?', action: 'How to deposit funds?' },
      { label: '💸 How to withdraw to bank?', action: 'How to withdraw to bank?' },
      { label: '⏳ Deposit pending verification?', action: 'My bank transfer deposit is pending' },
      { label: '🔑 How to reset security PIN?', action: 'How do I reset my security PIN?' },
      { label: '💬 Talk to WhatsApp Agent', action: 'Connect me to human WhatsApp support' }
    ]
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Try to restore session chat history from sessionStorage
    try {
      const saved = sessionStorage.getItem('nevo_ai_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [initialGreeting];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMasterSettings().then((s) => setSettings(s));
  }, []);

  // Save chat history to sessionStorage whenever messages update
  useEffect(() => {
    try {
      sessionStorage.setItem('nevo_ai_chat_history', JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend || !textToSend.trim() || isLoading) return;

    const userText = textToSend.trim();
    if (!customText) setInputMessage('');

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: timeStr
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Prepare chat history payload (up to last 6 messages)
      const historyPayload = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: historyPayload
        })
      });

      const data = await res.json();

      if (data.success) {
        const assistantMsg: ChatMessage = {
          id: `msg-asst-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          requiresHumanEscalation: data.requiresHumanEscalation,
          whatsappLink: data.whatsappLink || whatsappLink
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err: any) {
      console.error('[AI Chat] Request failed:', err);
      // Fallback client-side response if server request encounters network glitch
      let fallbackText = `I apologize for the momentary network hiccup! Here is quick guidance:\n\n• **Deposits**: Tap Deposit, choose at least ₦520, continue, and complete the exact amount through the fresh KoraPay hosted checkout shown after you continue.\n• **Confirmation**: Your wallet is credited only after KoraPay confirms the payment server-side.\n• **Withdrawals**: Complete 5 successful referrals and make a verified deposit of at least ₦520.\n• **Human Support**: Tap below to speak directly with an official agent on WhatsApp.`;
      
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        requiresHumanEscalation: true,
        whatsappLink,
        isError: false
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([initialGreeting]);
    sessionStorage.removeItem('nevo_ai_chat_history');
  };

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Quick Action Suggestions Chips
  const quickChips = [
    { label: '💳 How to Deposit', text: 'How do I make a deposit?' },
    { label: '💸 Withdraw Cash', text: 'How do I transfer money to my bank account?' },
    { label: '⏳ Deposit Pending', text: 'I made a bank transfer but my deposit is pending' },
    { label: '🔑 Reset Security PIN', text: 'How do I reset my 4-digit transaction PIN?' },
    { label: '💬 Human Agent', text: 'I want to speak with a human support agent on WhatsApp' }
  ];

  const content = (
    <div className="flex flex-col h-full w-full bg-[#07070c] text-white overflow-hidden font-sans relative">
      
      {/* Header */}
      <div className="px-4 py-3 bg-[#0a0a12] border-b border-white/[0.08] flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              id="btn-ai-chat-back"
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          <div className="relative">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-500 p-0.5 shadow-lg shadow-teal-500/20">
              <div className="h-full w-full bg-[#0c0c14] rounded-[10px] flex items-center justify-center">
                <Bot className="h-5 w-5 text-teal-400 animate-pulse" />
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#0a0a12] flex items-center justify-center">
              <span className="animate-ping h-full w-full rounded-full bg-emerald-400 opacity-75" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black tracking-tight font-display text-white">{brandName} Assistant</h3>
              <span className="px-1.5 py-0.2 text-[8px] font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30 rounded-md uppercase">
                AI 24/7
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
              Level-1 Customer Support • Online
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct WhatsApp Action in Header */}
          <a
            id="btn-header-whatsapp-escalate"
            href={`${whatsappLink}?text=Hello%20${encodeURIComponent(brandName)}%20Support%2C%20I%20need%20human%20assistance%20with...`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold transition-all"
            title="Connect directly to official WhatsApp Support"
          >
            <Headphones className="h-3.5 w-3.5" />
            <span>WhatsApp</span>
          </a>

          {/* Reset Chat */}
          <button
            id="btn-reset-ai-chat"
            type="button"
            onClick={handleResetChat}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Reset Chat History"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* Close button if in modal mode */}
          {mode === 'floating_modal' && onClose && (
            <button
              id="btn-close-ai-chat-modal"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Safety Banner */}
      <div className="bg-teal-950/40 border-b border-teal-500/20 px-3 py-1.5 flex items-center justify-between text-[10px] text-teal-200 font-sans">
        <div className="flex items-center gap-1.5 truncate">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-400 shrink-0" />
          <span className="truncate">Automated guidance only. For payment disputes or PIN resets, escalate to WhatsApp.</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 sm:p-4 space-y-4">
        
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id || index}
              className={`flex gap-2 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              {/* Avatar for Assistant */}
              {!isUser && (
                <div className="h-7 w-7 rounded-lg bg-teal-950 border border-teal-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4 text-teal-400" />
                </div>
              )}

              <div className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Bubble Container */}
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-sm transition-all ${
                    isUser
                      ? 'bg-gradient-to-r from-teal-600 to-violet-600 text-white rounded-tr-none font-medium'
                      : 'bg-slate-900/90 border border-white/10 text-slate-200 rounded-tl-none font-sans'
                  }`}
                >
                  {/* Message Text formatted */}
                  <div className="whitespace-pre-wrap break-words space-y-1">
                    {msg.text.split('\n').map((paragraph, pIdx) => (
                      <p key={pIdx} className={paragraph.startsWith('•') || paragraph.startsWith('*') ? 'pl-2 text-slate-300' : ''}>
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Copy Button for Assistant replies */}
                  {!isUser && (
                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                      <span>{msg.time}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.text, index)}
                        className="flex items-center gap-1 hover:text-teal-300 transition-colors cursor-pointer"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* User Timestamp */}
                  {isUser && (
                    <div className="mt-1 text-[9px] text-teal-200 font-mono text-right">
                      {msg.time}
                    </div>
                  )}
                </div>

                {/* Suggested Action Chips (if present in Assistant response) */}
                {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((sAction, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => handleSendMessage(sAction.action)}
                        className="text-[10px] font-medium px-2.5 py-1 rounded-xl bg-white/5 hover:bg-teal-500/20 border border-white/10 hover:border-teal-500/40 text-teal-300 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                      >
                        <span>{sAction.label}</span>
                        <ChevronRight className="h-3 w-3 opacity-60" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Prominent Human Escalation Callout Box (Requirement #5) */}
                {!isUser && (msg.requiresHumanEscalation || msg.text.toLowerCase().includes('whatsapp')) && (
                  <div className="mt-3 w-full p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 flex flex-col gap-2.5 shadow-lg">
                    <div className="flex items-center gap-2">
                      <Headphones className="h-4 w-4 text-emerald-400 shrink-0 animate-bounce" />
                      <span className="text-xs font-bold font-display text-white">Continue with Live Support</span>
                    </div>
                    <p className="text-[11px] text-slate-200 leading-normal font-sans">
                      I want to make sure you get the best help. Would you like to continue with our live WhatsApp support?
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                      <a
                        id="btn-escalate-whatsapp-chat"
                        href={`${msg.whatsappLink || whatsappLink}?text=Hello%20${encodeURIComponent(brandName)}%20Support%2C%20I%20need%20human%20assistance%20regarding%20my%20session...`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Chat on WhatsApp</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleSendMessage('I would like to continue asking questions here with AI.')}
                        className="w-full sm:w-auto py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs transition-all cursor-pointer active:scale-95"
                      >
                        Continue with AI
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Avatar for User */}
              {isUser && (
                <div className="h-7 w-7 rounded-lg bg-teal-950 border border-teal-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4 w-4 text-teal-400" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing Animation Indicator */}
        {isLoading && (
          <div className="flex gap-2.5 justify-start items-center animate-fade-in">
            <div className="h-7 w-7 rounded-lg bg-teal-950 border border-teal-500/30 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-teal-400" />
            </div>
            <div className="p-3 bg-slate-900 border border-white/10 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
              <span className="text-[11px] font-mono text-slate-400 mr-1">Nevo Assistant is thinking</span>
              <div className="h-1.5 w-1.5 bg-teal-400 rounded-full animate-bounce" />
              <div className="h-1.5 w-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="h-1.5 w-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Action Suggestion Bar */}
      <div className="px-3 py-2 bg-[#090910] border-t border-white/5 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider shrink-0 font-bold">Quick Topics:</span>
        {quickChips.map((chip, cIdx) => (
          <button
            key={cIdx}
            type="button"
            onClick={() => handleSendMessage(chip.text)}
            disabled={isLoading}
            className="text-[10px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-[#0a0a12] border-t border-white/[0.08] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="input-ai-support-message"
            type="text"
            placeholder="Ask Nevo Assistant anything..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-950 border border-white/10 focus:border-teal-400/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all disabled:opacity-50"
          />
          <button
            id="btn-send-ai-support-message"
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="h-10 w-10 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-md shrink-0 cursor-pointer"
            title="Send Message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        
        <div className="mt-1.5 flex items-center justify-between text-[9px] text-slate-500 font-mono">
          <span>Powered by {brandName} AI Core</span>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-400 transition-colors inline-flex items-center gap-0.5"
          >
            <span>Need human agent?</span>
            <ExternalLink className="h-2.5 w-2.5 inline" />
          </a>
        </div>
      </div>

    </div>
  );

  if (mode === 'floating_modal') {
    return (
      <div 
        id="nevo-ai-assistant-modal"
        className="fixed inset-0 z-[200] w-full h-full h-[100dvh] max-h-[100dvh] bg-[#07070c] flex flex-col pt-safe pb-safe overflow-hidden"
      >
        {content}
      </div>
    );
  }

  return content;
}
