import React from 'react';
import {
  Sparkles,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  Award,
  ArrowRight,
  Volume2,
  VolumeX,
  Compass,
} from 'lucide-react';
import { NoteDiagnosis } from '../types';

interface GeminiDiagnosisCardProps {
  diagnosis: NoteDiagnosis;
  onGenerateSummary?: () => void;
  onGenerateExam?: () => void;
  onSpeak?: (text: string, id: string) => void;
  onStopSpeak?: () => void;
  isSpeaking?: boolean;
}

export const GeminiDiagnosisCard: React.FC<GeminiDiagnosisCardProps> = ({
  diagnosis,
  onGenerateSummary,
  onGenerateExam,
  onSpeak,
  onStopSpeak,
  isSpeaking,
}) => {
  const diagnosisAudioText = `Gemini Study Diagnosis for ${diagnosis.topic}. What this material is about: ${diagnosis.whatItIsAbout}. High-yield exam focus: ${diagnosis.highYieldExamFocus}`;

  return (
    <div className="rounded-2xl bg-white border border-sky-200/90 p-6 sm:p-7 space-y-6 shadow-md shadow-sky-100/50 relative overflow-hidden text-slate-800">
      {/* Background ambient light blue tint */}
      <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-sky-100/40 blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-500 via-sky-400 to-blue-600 p-0.5 shadow-md shadow-sky-500/20">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-sky-600" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 tracking-wide uppercase">
                Gemini Deep Note Diagnosis
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                Studied & Ingested
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Gemini analyzed your notes first to map structure, exam targets & traps
            </p>
          </div>
        </div>

        {onSpeak && (
          <button
            onClick={() => {
              if (isSpeaking) {
                onStopSpeak?.();
              } else {
                onSpeak(diagnosisAudioText, 'diagnosis-card');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isSpeaking
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-sky-50/80 border-sky-200 text-sky-700 hover:bg-sky-100'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-amber-600" />
                <span>Stop Voice</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Listen to Diagnosis</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 1. What Gemini Discovered It Is About */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
            {diagnosis.subject}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Level: {diagnosis.academicLevelDetected} • {diagnosis.cognitiveDepth}
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
          {diagnosis.topic}
        </h3>
        <p className="text-sm text-slate-700 leading-relaxed font-normal bg-sky-50/50 p-4 rounded-xl border border-sky-150">
          {diagnosis.whatItIsAbout}
        </p>
      </div>

      {/* 2. Core Themes / Phases */}
      {diagnosis.coreThemes && diagnosis.coreThemes.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Core Themes & Structural Phases:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {diagnosis.coreThemes.map((theme, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-md bg-sky-100 text-sky-700 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-snug font-medium">{theme}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. High-Yield Exam Focus & Exam Trap Warnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* High-Yield Focus */}
        <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-2">
          <div className="flex items-center gap-2 text-sky-900 font-bold text-xs">
            <Lightbulb className="w-4 h-4 text-sky-600" />
            <span>High-Yield Exam Focus</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {diagnosis.highYieldExamFocus}
          </p>
        </div>

        {/* Identified Misconceptions / Traps */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Top Student Exam Traps Identified</span>
          </div>
          <ul className="space-y-1.5 text-xs text-amber-950">
            {diagnosis.identifiedMisconceptions?.map((m, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-amber-500 mt-0.5">•</span>
                <span className="leading-snug">{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. Recommended Question Setup Strategy */}
      {diagnosis.recommendedQuestionStrategy && (
        <div className="p-3.5 rounded-xl bg-sky-50/40 border border-sky-200 flex items-start gap-3 text-xs">
          <Compass className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-sky-900 block">
              Gemini's Tailored Exam Strategy:
            </span>
            <p className="text-slate-700 leading-relaxed">
              {diagnosis.recommendedQuestionStrategy}
            </p>
          </div>
        </div>
      )}

      {/* Action Triggers */}
      {(onGenerateSummary || onGenerateExam) && (
        <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-sky-100">
          {onGenerateSummary && (
            <button
              onClick={onGenerateSummary}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 shadow-sm shadow-sky-600/20 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Generate Full Summary</span>
            </button>
          )}

          {onGenerateExam && (
            <button
              onClick={onGenerateExam}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white flex items-center gap-1.5 shadow-sm shadow-amber-500/20 transition-all"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Generate Practice Exam</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
