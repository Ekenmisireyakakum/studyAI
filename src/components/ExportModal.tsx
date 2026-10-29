import React, { useState } from 'react';
import { X, Download, FileText, Check, Award, BookOpen } from 'lucide-react';
import { StudySummary, PracticeExam } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: StudySummary | null;
  exam: PracticeExam | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  summary,
  exam,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const generateMarkdownSummary = () => {
    if (!summary) return '';
    let md = `# ${summary.title}\n`;
    md += `*Subject: ${summary.subject} | Review Time: ~${summary.estimatedReadingTimeMinutes} mins*\n\n`;
    md += `## 1. Executive Summary\n${summary.executiveSummary}\n\n`;
    md += `## 2. Key Concepts & Definitions\n`;
    summary.keyConcepts.forEach((c) => {
      md += `### ${c.term}\n- **Definition**: ${c.definition}\n- **Significance**: ${c.significance}\n`;
      if (c.mnemonicOrAnalogy) md += `- **Memory Hook**: ${c.mnemonicOrAnalogy}\n`;
      md += `\n`;
    });
    md += `## 3. High-Yield Topic Breakdown\n`;
    summary.sectionBreakdowns.forEach((s) => {
      md += `### ${s.heading}\n${s.summary}\n`;
      s.bulletPoints.forEach((b) => (md += `- ${b}\n`));
      if (s.commonPitfalls) md += `*Common Exam Trap: ${s.commonPitfalls}*\n`;
      md += `\n`;
    });
    md += `## 4. 1-Page Cram Cheat Sheet\n`;
    summary.cheatSheet.forEach((item) => (md += `- ${item}\n`));
    return md;
  };

  const generateMarkdownExam = (includeAnswers: boolean) => {
    if (!exam) return '';
    let md = `# ${exam.examTitle}\n`;
    md += `*Allocated Time: ${exam.estimatedDurationMinutes} mins | Difficulty: ${exam.difficulty.toUpperCase()}*\n`;
    md += `*Instructions: ${exam.instructions}*\n\n---\n\n`;

    exam.questions.forEach((q, idx) => {
      md += `### Question ${idx + 1} (${q.points || 5} pts) [${q.topic}]\n`;
      md += `${q.question}\n\n`;
      if (q.type === 'mcq' && q.options) {
        q.options.forEach((opt) => (md += `- ${opt}\n`));
        md += `\n`;
      }

      if (includeAnswers) {
        md += `**Correct Answer / Marking Scheme:**\n`;
        md += `- Explanation: ${q.explanation}\n`;
        if (q.modelAnswer) md += `- Model Answer: ${q.modelAnswer}\n`;
        if (q.rubric && q.rubric.length > 0) {
          md += `- Grading Rubric:\n`;
          q.rubric.forEach((r) => (md += `  * ${r}\n`));
        }
        if (q.commonMistake) md += `- Common Distractor Trap: ${q.commonMistake}\n`;
        md += `\n---\n\n`;
      }
    });

    return md;
  };

  const handleDownload = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = (type: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-sky-100 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-6 text-slate-800">
        <div className="flex items-center justify-between border-b border-sky-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Export Study Material</h3>
              <p className="text-xs text-slate-500">Download formatted study notes & exam papers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Option 1: Study Guide Markdown */}
          {summary && (
            <div className="p-4 rounded-xl bg-sky-50/40 border border-sky-100 flex items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  <h4 className="text-sm font-semibold text-slate-900">Complete Study Guide (.md)</h4>
                </div>
                <p className="text-xs text-slate-600">
                  Executive summary, key concepts, mnemonics & 1-page cram sheet.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopy('summary', generateMarkdownSummary())}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs"
                >
                  {copiedType === 'summary' ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={() =>
                    handleDownload(
                      `${summary.title.replace(/\s+/g, '_')}_Study_Guide.md`,
                      generateMarkdownSummary(),
                      'text/markdown'
                    )
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white shadow-xs"
                >
                  Download
                </button>
              </div>
            </div>
          )}

          {/* Option 2: Clean Exam Paper */}
          {exam && (
            <div className="p-4 rounded-xl bg-sky-50/40 border border-sky-100 flex items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <h4 className="text-sm font-semibold text-slate-900">Blank Practice Exam (.md)</h4>
                </div>
                <p className="text-xs text-slate-600">
                  Questions only without solutions for mock test practice.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopy('exam-blank', generateMarkdownExam(false))}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs"
                >
                  {copiedType === 'exam-blank' ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={() =>
                    handleDownload(
                      `${exam.examTitle.replace(/\s+/g, '_')}_Practice_Test.md`,
                      generateMarkdownExam(false),
                      'text/markdown'
                    )
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                >
                  Download
                </button>
              </div>
            </div>
          )}

          {/* Option 3: Exam Paper With Full Solutions & Rubric */}
          {exam && (
            <div className="p-4 rounded-xl bg-sky-50/40 border border-sky-100 flex items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-semibold text-slate-900">Exam Solution Key & Rubric (.md)</h4>
                </div>
                <p className="text-xs text-slate-600">
                  Questions paired with complete explanations and model answers.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopy('exam-sol', generateMarkdownExam(true))}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs"
                >
                  {copiedType === 'exam-sol' ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={() =>
                    handleDownload(
                      `${exam.examTitle.replace(/\s+/g, '_')}_Solution_Key.md`,
                      generateMarkdownExam(true),
                      'text/markdown'
                    )
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                >
                  Download
                </button>
              </div>
            </div>
          )}

          {/* Option 4: Full JSON study data */}
          {(summary || exam) && (
            <div className="p-4 rounded-xl bg-sky-50/40 border border-sky-100 flex items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <h4 className="text-sm font-semibold text-slate-900">Complete Study Data (.json)</h4>
                </div>
                <p className="text-xs text-slate-600">
                  Raw JSON containing all generated flashcards, summaries, and questions.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() =>
                    handleDownload(
                      `ExamPrep_StudyData.json`,
                      JSON.stringify({ summary, exam }, null, 2),
                      'application/json'
                    )
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs"
                >
                  Download JSON
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
