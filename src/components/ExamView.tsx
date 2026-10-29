import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Printer,
  ChevronRight,
  ChevronLeft,
  Flag,
  RotateCcw,
  Sparkles,
  BookOpen,
  Send,
  AlertTriangle,
  Lightbulb,
  FileCheck,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  PracticeExam,
  ExamQuestion,
  StudentAnswerState,
  AnswerEvaluation,
} from '../types';

interface ExamViewProps {
  exam: PracticeExam;
  onRetakeExam: () => void;
  onAskTutorAboutQuestion: (question: ExamQuestion) => void;
}

export const ExamView: React.FC<ExamViewProps> = ({
  exam,
  onRetakeExam,
  onAskTutorAboutQuestion,
}) => {
  const [viewMode, setViewMode] = useState<'simulator' | 'sheet'>('simulator');
  const [feedbackMode, setFeedbackMode] = useState<'instant' | 'exam'>('instant');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StudentAnswerState>>({});
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showAnswerKeysInSheet, setShowAnswerKeysInSheet] = useState(false);

  // Timer state
  const totalSeconds = (exam.estimatedDurationMinutes || 20) * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Initialize or reset answers when exam changes
  useEffect(() => {
    const initialAnswers: Record<string, StudentAnswerState> = {};
    exam.questions.forEach((q) => {
      initialAnswers[q.id] = {
        isAnswered: false,
      };
    });
    setAnswers(initialAnswers);
    setCurrentIdx(0);
    setIsSubmitted(false);
    setFlaggedIds(new Set());
    setTimeLeft(totalSeconds);
    setIsTimerRunning(true);
  }, [exam]);

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, isSubmitted]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = exam.questions[currentIdx] || exam.questions[0];
  const currentAnswer = answers[currentQ?.id] || { isAnswered: false };

  // Handle MCQ selection
  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted && feedbackMode === 'exam') return;

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selectedOptionIndex: optionIndex,
        isAnswered: true,
      },
    }));
  };

  // Handle written answer input
  const handleWrittenChange = (text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        writtenAnswer: text,
        isAnswered: text.trim().length > 0,
      },
    }));
  };

  // Grade student's short answer or essay using server API
  const handleGradeWrittenAnswer = async () => {
    const written = currentAnswer.writtenAnswer?.trim();
    if (!written) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        evaluating: true,
      },
    }));

    try {
      const res = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQ.question,
          modelAnswer: currentQ.modelAnswer || currentQ.explanation,
          studentAnswer: written,
          rubric: currentQ.rubric,
        }),
      });

      if (!res.ok) {
        throw new Error('Grading request failed');
      }

      const evaluation: AnswerEvaluation = await res.json();
      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: {
          ...prev[currentQ.id],
          evaluating: false,
          evaluation,
        },
      }));
    } catch (err: any) {
      console.error('Error evaluating answer:', err);
      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: {
          ...prev[currentQ.id],
          evaluating: false,
        },
      }));
    }
  };

  // Toggle flag
  const toggleFlag = (id: string) => {
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Calculate scores
  const calculateResults = () => {
    let totalPossiblePoints = 0;
    let earnedPoints = 0;
    let mcqCorrect = 0;
    let mcqTotal = 0;
    let writtenTotal = 0;
    let writtenScoreSum = 0;

    exam.questions.forEach((q) => {
      const qPts = q.points || 5;
      totalPossiblePoints += qPts;
      const ans = answers[q.id];

      if (q.type === 'mcq') {
        mcqTotal++;
        if (ans && ans.selectedOptionIndex === q.correctOptionIndex) {
          earnedPoints += qPts;
          mcqCorrect++;
        }
      } else {
        writtenTotal++;
        if (ans && ans.evaluation) {
          const ratio = ans.evaluation.score / 100;
          earnedPoints += Math.round(qPts * ratio);
          writtenScoreSum += ans.evaluation.score;
        } else if (ans && ans.isAnswered) {
          // default completion credit if not AI graded yet
          earnedPoints += Math.round(qPts * 0.7);
        }
      }
    });

    const percent = Math.round((earnedPoints / Math.max(1, totalPossiblePoints)) * 100);
    let grade = 'F';
    if (percent >= 93) grade = 'A';
    else if (percent >= 85) grade = 'B';
    else if (percent >= 75) grade = 'C';
    else if (percent >= 65) grade = 'D';

    return {
      earnedPoints,
      totalPossiblePoints,
      percent,
      grade,
      mcqCorrect,
      mcqTotal,
      writtenTotal,
      writtenAverage: writtenTotal > 0 ? Math.round(writtenScoreSum / writtenTotal) : 0,
    };
  };

  const results = calculateResults();
  const answeredCount = Object.values(answers).filter((a) => a.isAnswered).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Controls Bar */}
      <div className="rounded-2xl bg-white border border-sky-100 p-5 shadow-sm shadow-sky-100/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
              {exam.difficulty.toUpperCase()} RIGOR
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {exam.questions.length} Questions • {exam.estimatedDurationMinutes} Mins
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {exam.examTitle || 'Practice Exam'}
          </h2>
        </div>

        {/* View Switchers */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center">
            <button
              onClick={() => setViewMode('simulator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'simulator'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Interactive Simulator
            </button>
            <button
              onClick={() => setViewMode('sheet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'sheet'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Question Sheet
            </button>
          </div>

          {viewMode === 'simulator' && !isSubmitted && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span className={`font-bold ${timeLeft < 180 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
                {formatTime(timeLeft)}
              </span>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="text-[10px] text-sky-700 hover:text-sky-900 underline ml-1 font-sans"
              >
                {isTimerRunning ? 'Pause' : 'Resume'}
              </button>
            </div>
          )}

          {viewMode === 'sheet' && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Paper</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: Interactive Exam Simulator */}
      {viewMode === 'simulator' && (
        <div className="space-y-6">
          {/* Question Navigator Bar */}
          <div className="bg-white border border-sky-100 p-4 rounded-xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Progress:</span>
                <strong className="text-slate-800 font-semibold">
                  {answeredCount} / {exam.questions.length} answered
                </strong>
              </div>

              {!isSubmitted && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Mode:</span>
                  <button
                    onClick={() =>
                      setFeedbackMode(feedbackMode === 'instant' ? 'exam' : 'instant')
                    }
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                      feedbackMode === 'instant'
                        ? 'bg-sky-50 text-sky-800 border-sky-300'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {feedbackMode === 'instant' ? 'Instant Explanations' : 'Exam Strict'}
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {exam.questions.map((q, idx) => {
                const ans = answers[q.id];
                const isFlagged = flaggedIds.has(q.id);
                const isCurrent = currentIdx === idx;
                let bgStyle = 'bg-slate-50 border-slate-200 text-slate-600 hover:border-sky-300';

                if (isSubmitted && q.type === 'mcq') {
                  if (ans?.selectedOptionIndex === q.correctOptionIndex) {
                    bgStyle = 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold';
                  } else {
                    bgStyle = 'bg-rose-100 border-rose-300 text-rose-900 font-bold';
                  }
                } else if (ans?.isAnswered) {
                  bgStyle = 'bg-sky-100 border-sky-300 text-sky-900 font-semibold';
                }

                if (isCurrent) {
                  bgStyle += ' ring-2 ring-sky-500 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-8 h-8 rounded-lg border text-xs font-mono relative transition-all flex items-center justify-center ${bgStyle}`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question Card */}
          {currentQ && (
            <div className="rounded-2xl bg-white border border-sky-100 p-6 sm:p-8 space-y-6 shadow-sm">
              {/* Question Metadata Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-sky-800 px-2.5 py-1 rounded bg-sky-50 border border-sky-200">
                    Question {currentIdx + 1} of {exam.questions.length}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                    {currentQ.topic || 'General'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {currentQ.points || 5} pts
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFlag(currentQ.id)}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      flaggedIds.has(currentQ.id)
                        ? 'bg-amber-50 text-amber-900 border-amber-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Flag className="w-3 h-3 text-amber-500" />
                    <span>{flaggedIds.has(currentQ.id) ? 'Flagged' : 'Flag for review'}</span>
                  </button>

                  <button
                    onClick={() => onAskTutorAboutQuestion(currentQ)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 transition-colors shadow-xs"
                  >
                    <HelpCircle className="w-3 h-3 text-sky-600" />
                    <span>Ask Tutor</span>
                  </button>
                </div>
              </div>

              {/* Question Prompt */}
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-line">
                  {currentQ.question}
                </h3>
              </div>

              {/* MCQ Options Rendering */}
              {currentQ.type === 'mcq' && currentQ.options && (
                <div className="space-y-3 pt-2">
                  {currentQ.options.map((option, optIdx) => {
                    const isSelected = currentAnswer.selectedOptionIndex === optIdx;
                    const isCorrect = currentQ.correctOptionIndex === optIdx;
                    const showFeedback =
                      (feedbackMode === 'instant' && currentAnswer.isAnswered) || isSubmitted;

                    let optionStyle =
                      'bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 text-slate-800';

                    if (isSelected) {
                      optionStyle = 'bg-sky-50 border-sky-500 text-sky-950 shadow-xs ring-1 ring-sky-400';
                    }

                    if (showFeedback) {
                      if (isCorrect) {
                        optionStyle =
                          'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-400';
                      } else if (isSelected && !isCorrect) {
                        optionStyle =
                          'bg-rose-50 border-rose-500 text-rose-950 ring-1 ring-rose-400';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-all shadow-xs ${optionStyle}`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5 border ${
                            isSelected
                              ? 'bg-sky-500 border-sky-500 text-white'
                              : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </div>

                        <span className="text-xs sm:text-sm leading-relaxed flex-1 font-medium">
                          {option.replace(/^[A-D]\)\s*/, '')}
                        </span>

                        {showFeedback && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        {showFeedback && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Short Answer / Essay Written Response Input */}
              {currentQ.type !== 'mcq' && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">
                        Your Written Answer (Type below to self-test):
                      </span>
                      <span className="text-slate-500">
                        {currentAnswer.writtenAnswer?.trim().split(/\s+/).filter(Boolean).length || 0} words
                      </span>
                    </div>

                    <textarea
                      value={currentAnswer.writtenAnswer || ''}
                      onChange={(e) => handleWrittenChange(e.target.value)}
                      rows={5}
                      placeholder={
                        currentQ.type === 'short_answer'
                          ? 'Write a concise conceptual response (2-4 sentences)...'
                          : 'Write an analytical synthesis addressing each requirement in the prompt...'
                      }
                      className="w-full bg-sky-50/20 border border-sky-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl p-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none leading-relaxed"
                    />
                  </div>

                  {/* AI Evaluation Button */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleGradeWrittenAnswer}
                      disabled={
                        !currentAnswer.writtenAnswer?.trim() || currentAnswer.evaluating
                      }
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all ${
                        !currentAnswer.writtenAnswer?.trim() || currentAnswer.evaluating
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-200'
                      }`}
                    >
                      {currentAnswer.evaluating ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>AI Professor Evaluating Response...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-sky-200" />
                          <span>{currentAnswer.evaluation ? 'Re-Grade with AI' : 'Grade My Answer with AI'}</span>
                        </>
                      )}
                    </button>

                    {currentQ.modelAnswer && (
                      <span className="text-xs text-slate-500">
                        {currentAnswer.evaluation ? 'Graded by AI' : 'Self-evaluate after writing'}
                      </span>
                    )}
                  </div>

                  {/* AI Feedback Card */}
                  {currentAnswer.evaluation && (
                    <div className="rounded-xl bg-sky-50/40 border border-sky-200 p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-sky-200/60 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-extrabold text-slate-900">
                            {currentAnswer.evaluation.score}
                            <span className="text-xs text-slate-500 font-normal">/100</span>
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                            Grade: {currentAnswer.evaluation.gradeLetter}
                          </span>
                        </div>
                        <span className="text-xs text-slate-600 font-medium">
                          {currentAnswer.evaluation.score >= 80 ? '🎉 Strong answer!' : '💡 Room for improvement'}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed italic">
                        "{currentAnswer.evaluation.feedbackSummary}"
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {currentAnswer.evaluation.strengths?.length > 0 && (
                          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
                            <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600" /> What You Nailed:
                            </span>
                            <ul className="list-disc list-inside text-emerald-950 space-y-1 pl-1 font-medium">
                              {currentAnswer.evaluation.strengths.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {currentAnswer.evaluation.missingPoints?.length > 0 && (
                          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
                            <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Points Missing for Full Marks:
                            </span>
                            <ul className="list-disc list-inside text-amber-950 space-y-1 pl-1 font-medium">
                              {currentAnswer.evaluation.missingPoints.map((m, i) => (
                                <li key={i}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {currentAnswer.evaluation.improvementAdvice && (
                        <div className="text-xs text-slate-800 bg-white p-3 rounded-lg border border-sky-100 flex items-start gap-2 shadow-xs">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>
                            <strong>Exam Tip:</strong> {currentAnswer.evaluation.improvementAdvice}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Explanation & Model Answer (shown in instant feedback mode or when submitted) */}
              {((feedbackMode === 'instant' && currentAnswer.isAnswered) || isSubmitted) && (
                <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-200 space-y-3">
                  <div className="flex items-center gap-2 text-sky-800 font-semibold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    <span>Official Solution & Pedagogical Explanation</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                    {currentQ.explanation}
                  </p>

                  {currentQ.modelAnswer && (
                    <div className="pt-2 border-t border-sky-200/60">
                      <span className="text-[11px] font-semibold text-sky-900 block mb-1">
                        Model Exemplary Answer:
                      </span>
                      <p className="text-xs text-slate-800 font-mono bg-white p-2.5 rounded-lg border border-sky-100 leading-relaxed">
                        {currentQ.modelAnswer}
                      </p>
                    </div>
                  )}

                  {currentQ.commonMistake && (
                    <div className="text-xs text-rose-900 flex items-start gap-2 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>
                        <strong>Distractor Trap:</strong> {currentQ.commonMistake}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Nav Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                  disabled={currentIdx === 0}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    currentIdx === 0
                      ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-50'
                      : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  {!isSubmitted ? (
                    <button
                      onClick={() => setIsSubmitted(true)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all"
                    >
                      Finish & Score Exam
                    </button>
                  ) : (
                    <button
                      onClick={onRetakeExam}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white transition-all shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake Exam</span>
                    </button>
                  )}

                  <button
                    onClick={() =>
                      setCurrentIdx((prev) => Math.min(exam.questions.length - 1, prev + 1))
                    }
                    disabled={currentIdx === exam.questions.length - 1}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      currentIdx === exam.questions.length - 1
                        ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-50'
                        : 'bg-sky-500 hover:bg-sky-600 text-white shadow-xs'
                    }`}
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Scorecard (after submission) */}
          {isSubmitted && (
            <div className="rounded-2xl bg-gradient-to-br from-white via-sky-50/50 to-blue-50/40 border border-sky-200 p-6 sm:p-8 space-y-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-200/80 pb-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-sky-700">
                    Official Exam Performance Report
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                    Final Score: {results.percent}%
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Earned {results.earnedPoints} out of {results.totalPossiblePoints} total points
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-sky-100 border border-sky-300 flex flex-col items-center justify-center">
                    <span className="text-xs text-sky-800 font-semibold uppercase">Grade</span>
                    <span className="text-2xl font-black text-sky-950">{results.grade}</span>
                  </div>
                </div>
              </div>

              {/* Metric Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-sky-100 p-4 rounded-xl shadow-xs">
                  <span className="text-xs text-slate-500 block mb-1">MCQ Accuracy</span>
                  <span className="text-lg font-bold text-slate-900">
                    {results.mcqCorrect} / {results.mcqTotal}
                  </span>
                  <span className="text-xs text-emerald-600 block mt-0.5 font-semibold">
                    {results.mcqTotal > 0 ? Math.round((results.mcqCorrect / results.mcqTotal) * 100) : 0}% correct
                  </span>
                </div>

                <div className="bg-white border border-sky-100 p-4 rounded-xl shadow-xs">
                  <span className="text-xs text-slate-500 block mb-1">Time Elapsed</span>
                  <span className="text-lg font-bold text-slate-900">
                    {formatTime(totalSeconds - timeLeft)}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Allocated: {exam.estimatedDurationMinutes} mins
                  </span>
                </div>

                <div className="bg-white border border-sky-100 p-4 rounded-xl shadow-xs">
                  <span className="text-xs text-slate-500 block mb-1">Exam Readiness</span>
                  <span className="text-lg font-bold text-slate-900">
                    {results.percent >= 80 ? 'Exam Ready 🚀' : 'Needs Review 📚'}
                  </span>
                  <span className="text-xs text-sky-700 block mt-0.5 font-semibold">
                    Target benchmark: 80%+
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-600">
                  Click any question pill at the top to review full explanations, or switch to "Full Question Sheet" to read solutions side-by-side.
                </p>
                <button
                  onClick={onRetakeExam}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white transition-colors shadow-xs"
                >
                  Retake Exam with Fresh State
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: Full Question Sheet / Printable View */}
      {viewMode === 'sheet' && (
        <div className="space-y-6">
          <div className="bg-white border border-sky-100 p-4 rounded-xl flex items-center justify-between shadow-xs">
            <span className="text-xs text-slate-700 font-medium">
              Exam Paper Format (suitable for printing or sequential reading)
            </span>
            <button
              onClick={() => setShowAnswerKeysInSheet(!showAnswerKeysInSheet)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition-colors flex items-center gap-1.5"
            >
              {showAnswerKeysInSheet ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showAnswerKeysInSheet ? 'Hide Marking Scheme' : 'Reveal Marking Scheme & Answers'}</span>
            </button>
          </div>

          <div className="space-y-6">
            {exam.questions.map((q, idx) => (
              <div
                key={q.id}
                className="rounded-xl bg-white border border-sky-100 p-6 space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-sky-100 text-sky-800 font-mono text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      [{q.topic}] • {q.points || 5} Points
                    </span>
                  </div>
                  <span className="text-[11px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {q.type.replace('_', ' ')}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                  {q.question}
                </h4>

                {/* MCQ Options */}
                {q.type === 'mcq' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-lg border font-medium ${
                          showAnswerKeysInSheet && q.correctOptionIndex === oIdx
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                            : 'bg-sky-50/40 border-sky-100 text-slate-800'
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}

                {/* Show Answer Scheme if toggled */}
                {showAnswerKeysInSheet && (
                  <div className="mt-4 p-4 rounded-xl bg-sky-50/50 border border-sky-200 space-y-2 text-xs text-slate-800">
                    <span className="font-bold text-sky-800 block">
                      Marking Scheme & Model Solution:
                    </span>
                    <p className="text-slate-700 leading-relaxed">{q.explanation}</p>
                    {q.modelAnswer && (
                      <p className="text-slate-900 font-mono bg-white p-2 rounded border border-sky-200 mt-1">
                        <strong>Model Answer:</strong> {q.modelAnswer}
                      </p>
                    )}
                    {q.rubric && q.rubric.length > 0 && (
                      <div className="pt-2">
                        <span className="font-semibold text-slate-700 block mb-1">
                          Rubric Criteria:
                        </span>
                        <ul className="list-disc list-inside text-slate-700 space-y-0.5 font-medium">
                          {q.rubric.map((r, rIdx) => (
                            <li key={rIdx}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
