import React, { useRef, useState } from 'react';
import {
  Upload,
  Sparkles,
  BookOpen,
  Award,
  Zap,
  Trash2,
  FileCheck,
  GraduationCap,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { SAMPLE_NOTES, SampleNote } from '../data/sampleNotes';
import { AcademicLevel, ExamDifficulty, QuestionType } from '../types';

interface NotesInputProps {
  notes: string;
  setNotes: (notes: string) => void;
  subject: string;
  setSubject: (subject: string) => void;
  academicLevel: AcademicLevel;
  setAcademicLevel: (level: AcademicLevel) => void;
  questionCount: number;
  setQuestionCount: (count: number) => void;
  difficulty: ExamDifficulty;
  setDifficulty: (diff: ExamDifficulty) => void;
  questionTypes: QuestionType[];
  setQuestionTypes: (types: QuestionType[]) => void;
  onGenerateSummary: () => void;
  onGenerateExam: () => void;
  onGenerateAll: () => void;
  isSummarizing: boolean;
  isGeneratingExam: boolean;
  hasSummary: boolean;
  hasExam: boolean;
}

export const NotesInput: React.FC<NotesInputProps> = ({
  notes,
  setNotes,
  subject,
  setSubject,
  academicLevel,
  setAcademicLevel,
  questionCount,
  setQuestionCount,
  difficulty,
  setDifficulty,
  questionTypes,
  setQuestionTypes,
  onGenerateSummary,
  onGenerateExam,
  onGenerateAll,
  isSummarizing,
  isGeneratingExam,
  hasSummary,
  hasExam,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);

  // Statistics
  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;
  const charCount = notes.length;
  const estimatedReadMins = Math.max(1, Math.ceil(wordCount / 200));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setNotes(content);
        // Try to set title from file name
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        if (!subject) setSubject(cleanName);
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectSample = (sample: SampleNote) => {
    setActiveSampleId(sample.id);
    setNotes(sample.content);
    setSubject(sample.subject);
    setAcademicLevel(sample.academicLevel as AcademicLevel);
  };

  const toggleQuestionType = (type: QuestionType) => {
    if (questionTypes.includes(type)) {
      if (questionTypes.length > 1) {
        setQuestionTypes(questionTypes.filter((t) => t !== type));
      }
    } else {
      setQuestionTypes([...questionTypes, type]);
    }
  };

  const isWorking = isSummarizing || isGeneratingExam;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/20 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            AI-Powered Academic Cockpit
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Turn Any Notes Into High-Yield Summaries & Exam Questions
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Paste your lecture notes, textbook chapters, or research slides. Gemini will extract core concepts,
            build a 1-page cram sheet, generate flashcards, and create realistic exam questions with interactive self-grading.
          </p>
        </div>

        {/* Subtle glowing orb */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
      </div>

      {/* Preset Sample Notes quick selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quick Try with Sample Lecture Notes
          </span>
          <span className="text-xs text-slate-500">Click any preset to load instantly</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_NOTES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className={`p-3.5 rounded-xl border text-left transition-all relative group ${
                activeSampleId === sample.id
                  ? 'bg-indigo-950/60 border-indigo-500/60 ring-1 ring-indigo-500/50 shadow-md shadow-indigo-900/30'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                  {sample.subject.split('/')[0]}
                </span>
                {activeSampleId === sample.id && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                )}
              </div>
              <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-indigo-200 line-clamp-1">
                {sample.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                {sample.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Area & Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Notes Textarea */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <label htmlFor="notes-area" className="text-sm font-semibold text-slate-200">
                Your Lecture Notes / Study Text
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2.5 py-1 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors"
              >
                <Upload className="w-3 h-3" />
                <span>Upload .txt / .md</span>
              </button>
              {notes.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setNotes('');
                    setActiveSampleId(null);
                  }}
                  className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded-md hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <textarea
              id="notes-area"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (activeSampleId) setActiveSampleId(null);
              }}
              rows={16}
              placeholder="Paste your study notes, textbook summaries, syllabus content, or research excerpts here... (e.g. key terms, equations, dates, mechanisms, case studies)"
              className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-4 text-slate-100 placeholder:text-slate-500 font-mono text-xs sm:text-sm leading-relaxed resize-y outline-none transition-all"
            />

            {/* Note Stats bar */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-2 py-1.5 bg-slate-900 border-t border-slate-800/80 rounded-b-xl -mt-2">
              <div className="flex items-center gap-4">
                <span>
                  <strong className="text-slate-200">{wordCount}</strong> words
                </span>
                <span>
                  <strong className="text-slate-200">{charCount}</strong> characters
                </span>
                <span>
                  ~<strong className="text-slate-200">{estimatedReadMins}</strong> min read
                </span>
              </div>
              <div>
                {wordCount < 30 ? (
                  <span className="text-amber-400/80 text-[11px] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Provide at least 30 words for best results
                  </span>
                ) : (
                  <span className="text-emerald-400/90 text-[11px] flex items-center gap-1">
                    <FileCheck className="w-3 h-3" /> Ready for AI processing
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Exam & Summary Configuration */}
        <div className="space-y-5 bg-slate-900/70 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Study Set Settings</h3>
            </div>

            {/* Academic Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                Academic Level
              </label>
              <select
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value as AcademicLevel)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none"
              >
                <option value="High School">High School</option>
                <option value="Undergraduate / College">Undergraduate / College</option>
                <option value="Graduate / Professional">Graduate / Professional</option>
                <option value="Competitive Exams (MCAT / USMLE / Bar / GRE)">
                  Competitive Exams (MCAT / Bar / GRE)
                </option>
              </select>
            </div>

            {/* Subject Tag */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Subject / Course Name (Optional)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Molecular Biology, ECON 101"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Question Count */}
            <div className="space-y-2 pt-1 border-t border-slate-800/60">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-300">Exam Questions to Generate</span>
                <span className="font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10">
                  {questionCount} questions
                </span>
              </div>
              <input
                type="range"
                min={4}
                max={15}
                step={1}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>4 (Quick drill)</span>
                <span>8 (Standard)</span>
                <span>15 (Full exam)</span>
              </div>
            </div>

            {/* Exam Difficulty */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Target Rigor / Difficulty</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'balanced', label: 'Balanced (Mix)' },
                  { id: 'challenging', label: 'Challenging' },
                  { id: 'mastery', label: 'Mastery / Tricky' },
                  { id: 'easy', label: 'Foundational' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id as ExamDifficulty)}
                    className={`py-1.5 px-2.5 rounded-lg border text-[11px] font-medium transition-all ${
                      difficulty === d.id
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Types */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Question Types Included</label>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'mcq', label: 'Multiple Choice (MCQ with rationale)' },
                  { id: 'short_answer', label: 'Short Conceptual (with AI grading)' },
                  { id: 'essay', label: 'Analytical Essay / Case' },
                ].map((type) => (
                  <label
                    key={type.id}
                    onClick={() => toggleQuestionType(type.id as QuestionType)}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={questionTypes.includes(type.id as QuestionType)}
                      onChange={() => {}}
                      className="accent-indigo-500 rounded"
                    />
                    <span className="text-[11px] text-slate-300">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-4 border-t border-slate-800">
            <button
              onClick={onGenerateAll}
              disabled={wordCount < 15 || isWorking}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                wordCount < 15 || isWorking
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-indigo-600/30 active:scale-[0.99]'
              }`}
            >
              {isWorking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>
                    {isSummarizing && isGeneratingExam
                      ? 'Generating Full Study Toolkit...'
                      : isSummarizing
                      ? 'Synthesizing Summary & Cards...'
                      : 'Generating Practice Exam...'}
                  </span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Generate All (Summary + Practice Exam)</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onGenerateSummary}
                disabled={wordCount < 15 || isWorking}
                className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  wordCount < 15 || isWorking
                    ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                    : 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{hasSummary ? 'Re-Summarize' : 'Summarize Only'}</span>
              </button>

              <button
                onClick={onGenerateExam}
                disabled={wordCount < 15 || isWorking}
                className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  wordCount < 15 || isWorking
                    ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/50'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{hasExam ? 'Regenerate Exam' : 'Exam Only'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
