import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  FileCheck2,
  Copy,
  Check,
  Award,
  Layers,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { StudySummary } from '../types';
import { GeminiDiagnosisCard } from './GeminiDiagnosisCard';

interface SummaryViewProps {
  summary: StudySummary;
  onGoToExam: () => void;
  onGoToFlashcards: () => void;
  onAskTutorAboutConcept: (concept: string) => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  summary,
  onGoToExam,
  onGoToFlashcards,
  onAskTutorAboutConcept,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'exec' | 'concepts' | 'sections' | 'cram' | 'diagnosis'>('exec');
  const [copied, setCopied] = useState(false);

  const handleCopySummary = () => {
    let fullText = `# ${summary.title}\n\n`;
    fullText += `## Executive Summary\n${summary.executiveSummary}\n\n`;
    fullText += `## Key Concepts\n`;
    summary.keyConcepts.forEach((c) => {
      fullText += `### ${c.term}\n- Definition: ${c.definition}\n- Significance: ${c.significance}\n`;
      if (c.mnemonicOrAnalogy) fullText += `- Analogy/Mnemonic: ${c.mnemonicOrAnalogy}\n`;
      fullText += `\n`;
    });
    fullText += `## Section Breakdown\n`;
    summary.sectionBreakdowns.forEach((s) => {
      fullText += `### ${s.heading}\n${s.summary}\n`;
      s.bulletPoints.forEach((b) => (fullText += `- ${b}\n`));
      if (s.commonPitfalls) fullText += `*Exam Pitfall:* ${s.commonPitfalls}\n`;
      fullText += `\n`;
    });
    fullText += `## 1-Page Cram Sheet\n`;
    summary.cheatSheet.forEach((item) => (fullText += `• ${item}\n`));

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Title & Metadata Card */}
      <div className="rounded-2xl bg-white border border-sky-100 p-6 shadow-sm shadow-sky-100/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
              {summary.subject || 'Academic Summary'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ~{summary.estimatedReadingTimeMinutes || 4} min review time
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {summary.title}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied' : 'Copy All'}</span>
          </button>

          {summary.flashcards && summary.flashcards.length > 0 && (
            <button
              onClick={onGoToFlashcards}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors shadow-xs"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Study {summary.flashcards.length} Flashcards</span>
            </button>
          )}

          <button
            onClick={onGoToExam}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-200 transition-all"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Take Practice Exam</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 no-scrollbar">
        <button
          onClick={() => setActiveSubTab('exec')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeSubTab === 'exec'
              ? 'bg-sky-500 text-white shadow-sm shadow-sky-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50/70'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Executive Summary</span>
        </button>

        <button
          onClick={() => setActiveSubTab('concepts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeSubTab === 'concepts'
              ? 'bg-sky-500 text-white shadow-sm shadow-sky-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50/70'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Key Concepts & Mnemonics</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-100 text-sky-800 border border-sky-200">
            {summary.keyConcepts?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('sections')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeSubTab === 'sections'
              ? 'bg-sky-500 text-white shadow-sm shadow-sky-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50/70'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Topic Breakdown & Exam Pitfalls</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-100 text-sky-800 border border-sky-200">
            {summary.sectionBreakdowns?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('cram')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeSubTab === 'cram'
              ? 'bg-amber-500 text-white font-bold shadow-sm shadow-amber-200'
              : 'text-amber-800 hover:text-amber-900 hover:bg-amber-50'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>1-Page Cram Sheet</span>
        </button>

        {summary.diagnosis && (
          <button
            onClick={() => setActiveSubTab('diagnosis')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeSubTab === 'diagnosis'
                ? 'bg-sky-700 text-white shadow-sm'
                : 'text-sky-800 hover:text-sky-950 hover:bg-sky-100/70 border border-sky-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>Gemini Deep Diagnosis</span>
          </button>
        )}
      </div>

      {/* Tab 0: Gemini Deep Diagnosis */}
      {activeSubTab === 'diagnosis' && summary.diagnosis && (
        <GeminiDiagnosisCard
          diagnosis={summary.diagnosis}
          onGenerateExam={onGoToExam}
        />
      )}

      {/* Tab 1: Executive Summary */}
      {activeSubTab === 'exec' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-sky-100 p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-sky-700 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>Core Synthesis & High-Yield Understanding</span>
            </div>
            <div className="text-slate-800 leading-relaxed text-sm sm:text-base space-y-4 whitespace-pre-line font-normal">
              {summary.executiveSummary}
            </div>
          </div>

          {/* Quick Highlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-sky-50/70 border border-sky-200 p-5 shadow-xs">
              <h4 className="text-sm font-semibold text-sky-900 flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-sky-600" />
                Why This Material Is Tested
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                Examiners focus heavily on the underlying mechanisms and relational trade-offs in this topic,
                especially how slight changes in parameters impact whole system outcomes.
              </p>
            </div>

            <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-5 shadow-xs">
              <h4 className="text-sm font-semibold text-amber-900 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Top Exam Advice
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                Pay close attention to specific terminology. Using precise vocabulary in short answers
                is frequently required by standard grading rubrics.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Key Concepts & Mnemonics */}
      {activeSubTab === 'concepts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary.keyConcepts.map((concept, index) => (
            <div
              key={index}
              className="rounded-xl bg-white border border-sky-100 p-5 space-y-3 hover:border-sky-300 transition-all flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-base font-bold text-slate-900 tracking-tight">
                    {concept.term}
                  </h4>
                  <span className="text-[10px] font-mono text-sky-800 px-2 py-0.5 rounded bg-sky-50 border border-sky-200">
                    Concept #{index + 1}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {concept.definition}
                </p>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-sky-800 block mb-0.5">
                    Significance on Exams:
                  </span>
                  <p className="text-xs text-slate-600 leading-normal">
                    {concept.significance}
                  </p>
                </div>
              </div>

              {concept.mnemonicOrAnalogy && (
                <div className="mt-3 p-3 rounded-lg bg-sky-50/80 border border-sky-200 flex items-start gap-2.5">
                  <span className="text-sm">🧠</span>
                  <div>
                    <span className="text-[11px] font-semibold text-sky-900 block">
                      Analogy / Memory Hook
                    </span>
                    <p className="text-xs text-sky-950 leading-snug">
                      {concept.mnemonicOrAnalogy}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onAskTutorAboutConcept(concept.term)}
                  className="text-[11px] font-medium text-sky-600 hover:text-sky-800 flex items-center gap-1 transition-colors"
                >
                  <span>Ask AI Tutor to elaborate</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Topic Breakdown & Exam Pitfalls */}
      {activeSubTab === 'sections' && (
        <div className="space-y-5">
          {summary.sectionBreakdowns.map((section, index) => (
            <div
              key={index}
              className="rounded-xl bg-white border border-sky-100 p-6 space-y-4 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center text-xs font-bold font-mono">
                  {index + 1}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {section.heading}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {section.summary}
              </p>

              {/* Bullet Points */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Key Takeaways
                </span>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-800">
                  {section.bulletPoints.map((bp, bIndex) => (
                    <li key={bIndex} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0" />
                      <span className="leading-relaxed">{bp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Pitfall Callout */}
              {section.commonPitfalls && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-rose-900 block">
                      Common Exam Trap / Misconception:
                    </span>
                    <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                      {section.commonPitfalls}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: 1-Page Cram Sheet */}
      {activeSubTab === 'cram' && (
        <div className="rounded-2xl bg-white border border-amber-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  High-Density Cram Cheat Sheet
                </h3>
                <p className="text-xs text-slate-500">
                  The absolute most tested formulas, mechanisms, rules, and facts condensed for quick review.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const text = summary.cheatSheet.map((item) => `• ${item}`).join('\n');
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-xs font-medium text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-amber-700" />}
              <span>{copied ? 'Copied' : 'Copy Cram Sheet'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {summary.cheatSheet.map((fact, index) => (
              <div
                key={index}
                className="p-3.5 rounded-xl bg-sky-50/40 border border-sky-100 flex items-start gap-3 hover:border-sky-200 transition-colors"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <p className="text-xs sm:text-sm text-slate-800 leading-snug">
                  {fact}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
