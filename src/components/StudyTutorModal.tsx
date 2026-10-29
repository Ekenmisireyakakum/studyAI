import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquareQuote,
  X,
  Send,
  Sparkles,
  Lightbulb,
  HelpCircle,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { TutorMessage } from '../types';

interface StudyTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: string;
  initialQuestion?: string;
}

export const StudyTutorModal: React.FC<StudyTutorModalProps> = ({
  isOpen,
  onClose,
  notes,
  initialQuestion = '',
}) => {
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your AI Study Tutor. Ask me to break down any confusing concept from your notes, explain why an exam answer is right or wrong, or test you with quick practice drills!",
      keyTakeaway: 'Mastery comes from active explanation and connection-making.',
      timestamp: Date.now(),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuestion && isOpen) {
      setInputQuery(initialQuestion);
    }
  }, [initialQuestion, isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || isLoading) return;

    const userMsg: TutorMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: q,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/ask-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          question: q,
          chatHistory: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error('Tutor consultation failed');
      }

      const data = await res.json();
      const botMsg: TutorMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: data.answer,
        keyTakeaway: data.keyTakeaway,
        followUpExamQuestions: data.followUpExamQuestions,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Tutor error:', err);
      const errMsg: TutorMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: 'Sorry, I encountered an issue connecting to the AI model. Please verify your connection or try rephrasing your question.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'Explain the most confusing concept with a simple analogy',
    'What is the #1 trick question professors ask on this?',
    'Summarize this into 3 memorable bullet points for cramming',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-sky-100 rounded-2xl w-full max-w-2xl h-[620px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-sky-100 flex items-center justify-between bg-sky-50/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center border border-sky-200 shadow-xs">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>AI Study Tutor</span>
                <span className="text-[10px] font-semibold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
                  Context-Aware
                </span>
              </h3>
              <p className="text-xs text-slate-500">Ask anything about your notes & exam concepts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar bg-slate-50/40">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-sky-500 text-white rounded-br-none shadow-sm shadow-sky-200'
                    : 'bg-white border border-sky-100 text-slate-800 rounded-bl-none space-y-3 shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line font-normal">{m.text}</div>

                {m.keyTakeaway && (
                  <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-sky-900 text-xs font-medium">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Takeaway:</strong> {m.keyTakeaway}
                    </span>
                  </div>
                )}

                {m.followUpExamQuestions && m.followUpExamQuestions.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Potential Exam Follow-Ups:
                    </span>
                    {m.followUpExamQuestions.map((q, qIdx) => (
                      <button
                        key={qIdx}
                        onClick={() => handleSend(`How would I answer this exam question: "${q}"?`)}
                        className="w-full text-left p-2.5 rounded-lg bg-sky-50/60 border border-sky-100 hover:border-sky-300 hover:bg-sky-50 text-sky-900 text-[11px] flex items-center justify-between gap-2 group transition-all"
                      >
                        <span className="line-clamp-1">{q}</span>
                        <ArrowRight className="w-3 h-3 text-sky-400 group-hover:text-sky-600 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-sky-800 bg-white border border-sky-200 rounded-xl px-4 py-3 max-w-[70%] shadow-xs">
              <div className="w-3 h-3 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <span>Tutor is formulating conceptual answer...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length <= 2 && (
          <div className="px-5 py-2 border-t border-slate-100 bg-white flex flex-wrap items-center gap-2 text-[11px] no-scrollbar">
            <span className="text-slate-400 shrink-0">Try asking:</span>
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 transition-colors shadow-2xs"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-sky-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask a question about your study notes..."
              className="flex-1 bg-sky-50/30 border border-sky-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className={`p-2.5 rounded-xl font-semibold transition-all ${
                !inputQuery.trim() || isLoading
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-sky-500 hover:bg-sky-600 text-white shadow-xs'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
