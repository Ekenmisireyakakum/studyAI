import React, { useState } from 'react';
import {
  Sparkles,
  User,
  Volume2,
  VolumeX,
  Copy,
  Check,
  BookOpen,
  Award,
  Layers,
  FileText,
  FileSpreadsheet,
  Headphones,
  ArrowRight,
} from 'lucide-react';
import { ChatMessage, StudySummary, PracticeExam } from '../types';
import { GeminiDiagnosisCard } from './GeminiDiagnosisCard';

interface ChatMessageItemProps {
  message: ChatMessage;
  onOpenSummary: (summary: StudySummary) => void;
  onOpenExam: (exam: PracticeExam) => void;
  onOpenFlashcards: () => void;
  onSpeak: (text: string, id: string) => void;
  onStopSpeak: () => void;
  isSpeakingThis: boolean;
  isGeneratingTTSThis: boolean;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onOpenSummary,
  onOpenExam,
  onOpenFlashcards,
  onSpeak,
  onStopSpeak,
  isSpeakingThis,
  isGeneratingTTSThis,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeak = () => {
    if (isSpeakingThis || isGeneratingTTSThis) {
      onStopSpeak();
    } else {
      onSpeak(message.content, message.id);
    }
  };

  return (
    <div
      className={`py-6 px-4 sm:px-6 transition-colors ${
        isUser
          ? 'bg-sky-50/50 border-y border-sky-100/70'
          : 'bg-white border-y border-slate-100'
      }`}
    >
      <div className="max-w-3xl mx-auto flex items-start gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center border border-slate-300">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 via-sky-400 to-blue-600 p-0.5 shadow-md shadow-sky-500/20">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-sky-600" />
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 space-y-3 overflow-hidden">
          {/* Header Name & Timestamp */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 tracking-tight">
              {isUser ? 'You' : 'ExamPrep AI (Gemini)'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Attached File Pill if uploaded */}
          {message.attachedFile && (
            <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200 flex items-center gap-3 w-fit max-w-full">
              <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
                {message.attachedFile.isAudio ? (
                  <Headphones className="w-4 h-4 text-emerald-600" />
                ) : message.attachedFile.isPdf ? (
                  <FileSpreadsheet className="w-4 h-4 text-rose-500" />
                ) : (
                  <FileText className="w-4 h-4 text-sky-600" />
                )}
              </div>
              <div className="text-xs overflow-hidden">
                <span className="font-semibold text-slate-800 block truncate">
                  {message.attachedFile.name}
                </span>
                <span className="text-[11px] text-slate-500">
                  {message.attachedFile.isPdf
                    ? 'Uploaded PDF Lecture Document'
                    : message.attachedFile.isAudio
                    ? 'Uploaded Audio Lecture Recording'
                    : 'Uploaded Text Notes'}
                </span>
              </div>
            </div>
          )}

          {/* Message Text Content */}
          <div className="text-sm text-slate-800 leading-relaxed space-y-3 whitespace-pre-line font-normal">
            {message.content}
          </div>

          {/* Gemini Deep Study Diagnosis Card */}
          {message.diagnosis && (
            <div className="mt-4">
              <GeminiDiagnosisCard
                diagnosis={message.diagnosis}
                onGenerateSummary={message.summary ? () => onOpenSummary(message.summary!) : undefined}
                onGenerateExam={message.exam ? () => onOpenExam(message.exam!) : undefined}
                onSpeak={onSpeak}
                onStopSpeak={onStopSpeak}
                isSpeaking={isSpeakingThis}
              />
            </div>
          )}

          {/* If Message generated a Study Summary */}
          {message.summary && (
            <div className="mt-4 p-5 rounded-2xl bg-white border border-sky-200 space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                      {message.summary.subject || 'Study Set'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      ~{message.summary.estimatedReadingTimeMinutes || 4} min review
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 tracking-tight">
                    {message.summary.title}
                  </h4>
                </div>

                <button
                  onClick={() => onOpenSummary(message.summary!)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 shadow-xs shadow-sky-600/30 transition-all shrink-0"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open Full Summary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Key Concept Badges */}
              {message.summary.keyConcepts?.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Core Concepts Extracted:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {message.summary.keyConcepts.map((c, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs bg-sky-50/70 border border-sky-150 text-sky-900 font-medium"
                      >
                        💡 {c.term}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* If Message generated an Exam */}
          {message.exam && (
            <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-white to-amber-50/30 border border-amber-200 space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {message.exam.difficulty.toUpperCase()} RIGOR
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {message.exam.questions?.length} Questions • {message.exam.estimatedDurationMinutes} Mins
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 tracking-tight">
                    {message.exam.examTitle}
                  </h4>
                </div>

                <button
                  onClick={() => onOpenExam(message.exam!)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-sm shadow-amber-500/20 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Start Practice Exam</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Includes multiple-choice questions with full distractor explanations and short conceptual questions with instant AI scoring.
              </p>
            </div>
          )}

          {/* Action Toolbar on Assistant Messages (Text-to-Speech + Copy) */}
          {!isUser && (
            <div className="flex items-center gap-2 pt-2 text-xs text-slate-500">
              {/* Text-to-Speech (TTS) Button */}
              <button
                onClick={handleToggleSpeak}
                title={isSpeakingThis ? 'Pause / Stop Audio' : 'Listen with Text-to-Speech'}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                  isSpeakingThis
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                    : isGeneratingTTSThis
                    ? 'bg-sky-100 text-sky-800 border-sky-300'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-sky-700 hover:bg-sky-50 hover:border-sky-200'
                }`}
              >
                {isGeneratingTTSThis ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[11px]">Generating Voice...</span>
                  </>
                ) : isSpeakingThis ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span className="text-[11px]">Playing (Click to Stop)</span>
                    <span className="flex gap-0.5 ml-1">
                      <span className="w-1 h-2.5 bg-amber-500 animate-bounce" />
                      <span className="w-1 h-3.5 bg-amber-500 animate-bounce delay-75" />
                      <span className="w-1 h-2 bg-amber-500 animate-bounce delay-150" />
                    </span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                    <span className="text-[11px]">Read Aloud</span>
                  </>
                )}
              </button>

              {/* Copy Button */}
              <button
                onClick={handleCopy}
                title="Copy text"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] text-emerald-700 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
