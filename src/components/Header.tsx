import React from 'react';
import { BookOpen, HelpCircle, FileText, Sparkles, Layers, Award, Download, MessageSquareQuote } from 'lucide-react';

interface HeaderProps {
  activeTab: 'input' | 'summary' | 'flashcards' | 'exam';
  setActiveTab: (tab: 'input' | 'summary' | 'flashcards' | 'exam') => void;
  hasSummary: boolean;
  hasExam: boolean;
  flashcardCount: number;
  questionCount: number;
  onOpenTutor: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hasSummary,
  hasExam,
  flashcardCount,
  questionCount,
  onOpenTutor,
  onOpenExport,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">ExamPrep AI</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Smart Notes Summarizer & Exam Question Generator</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('input')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'input'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Notes & Input</span>
            </button>

            <button
              onClick={() => setActiveTab('summary')}
              disabled={!hasSummary}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                !hasSummary
                  ? 'opacity-40 cursor-not-allowed text-slate-500'
                  : activeTab === 'summary'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Summary</span>
              {hasSummary && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('flashcards')}
              disabled={flashcardCount === 0}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                flashcardCount === 0
                  ? 'opacity-40 cursor-not-allowed text-slate-500'
                  : activeTab === 'flashcards'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Flashcards</span>
              {flashcardCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-indigo-300 border border-slate-700">
                  {flashcardCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('exam')}
              disabled={!hasExam}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                !hasExam
                  ? 'opacity-40 cursor-not-allowed text-slate-500'
                  : activeTab === 'exam'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Practice Exam</span>
              {hasExam && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/30 text-amber-300 font-bold border border-amber-500/30">
                  {questionCount} Qs
                </span>
              )}
            </button>
          </nav>

          {/* Quick Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenTutor}
              title="Ask AI Study Tutor"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 border border-indigo-500/20 transition-colors"
            >
              <MessageSquareQuote className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Ask AI Tutor</span>
            </button>

            {(hasSummary || hasExam) && (
              <button
                onClick={onOpenExport}
                title="Export Study Material"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Export</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
