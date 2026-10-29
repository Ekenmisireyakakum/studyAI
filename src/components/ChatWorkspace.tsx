import React, { useRef, useEffect, useState } from 'react';
import {
  Menu,
  Sparkles,
  BookOpen,
  Award,
  Download,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Headphones,
} from 'lucide-react';
import { ChatMessage, StudySummary, PracticeExam, AttachedFile } from '../types';
import { ChatMessageItem } from './ChatMessageItem';
import { ChatInputBar } from './ChatInputBar';
import { SAMPLE_NOTES, SampleNote } from '../data/sampleNotes';

interface ChatWorkspaceProps {
  sessionTitle: string;
  messages: ChatMessage[];
  onSendMessage: (text: string, attachedFile?: AttachedFile) => void;
  isLoading: boolean;
  onToggleSidebar: () => void;
  activeViewTab: 'chat' | 'summary' | 'flashcards' | 'exam';
  setActiveViewTab: (tab: 'chat' | 'summary' | 'flashcards' | 'exam') => void;
  summary: StudySummary | null;
  exam: PracticeExam | null;
  onOpenSummary: (summary: StudySummary) => void;
  onOpenExam: (exam: PracticeExam) => void;
  onOpenFlashcards: () => void;
  onOpenExport: () => void;
  onLoadPreset: (sample: SampleNote) => void;
  // Speech controls
  isSpeaking: boolean;
  isGeneratingTTS: boolean;
  playingId: string | null;
  speak: (text: string, id?: string) => void;
  stopSpeaking: () => void;
  isListening: boolean;
  interimTranscript: string;
  startListening: (onResult: (text: string) => void) => void;
  stopListening: () => void;
  onQuickAction: (actionType: 'summarize' | 'exam' | 'flashcards' | 'all') => void;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  sessionTitle,
  messages,
  onSendMessage,
  isLoading,
  onToggleSidebar,
  activeViewTab,
  setActiveViewTab,
  summary,
  exam,
  onOpenSummary,
  onOpenExam,
  onOpenFlashcards,
  onOpenExport,
  onLoadPreset,
  isSpeaking,
  isGeneratingTTS,
  playingId,
  speak,
  stopSpeaking,
  isListening,
  interimTranscript,
  startListening,
  stopListening,
  onQuickAction,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const dragDropInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    processDroppedFile(file);
  };

  const processDroppedFile = (file: File) => {
    const isAudio = file.type.startsWith('audio/') || /\.(mp3|wav|m4a|webm|ogg)$/i.test(file.name);
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

    const reader = new FileReader();
    if (isPdf || isAudio) {
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        onSendMessage(`I uploaded "${file.name}". Please study it, summarize, and generate practice exam questions.`, {
          name: file.name,
          size: file.size,
          type: file.type || (isPdf ? 'application/pdf' : 'audio/webm'),
          base64,
          isAudio,
          isPdf,
        });
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = () => {
        const text = reader.result as string;
        onSendMessage(`I uploaded "${file.name}". Please study it, summarize, and generate practice exam questions.`, {
          name: file.name,
          size: file.size,
          type: file.type || 'text/plain',
          text,
          isAudio: false,
          isPdf: false,
        });
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white text-slate-800">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900 tracking-tight truncate max-w-[200px] sm:max-w-xs">
              {sessionTitle || 'New Study Session'}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
              <Sparkles className="w-3 h-3 text-sky-600" />
              Gemini 3.8 Flash
            </span>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center text-xs">
            <button
              onClick={() => setActiveViewTab('chat')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeViewTab === 'chat'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chat
            </button>

            <button
              onClick={() => setActiveViewTab('summary')}
              disabled={!summary}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                !summary
                  ? 'opacity-40 cursor-not-allowed text-slate-400'
                  : activeViewTab === 'summary'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Summary</span>
              {summary && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
            </button>

            <button
              onClick={() => setActiveViewTab('flashcards')}
              disabled={!summary?.flashcards?.length}
              className={`px-3 py-1 rounded-lg font-medium transition-all hidden md:flex items-center gap-1 ${
                !summary?.flashcards?.length
                  ? 'opacity-40 cursor-not-allowed text-slate-400'
                  : activeViewTab === 'flashcards'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Cards</span>
              {summary?.flashcards?.length ? (
                <span className="text-[10px] text-slate-500 font-mono">
                  {summary.flashcards.length}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setActiveViewTab('exam')}
              disabled={!exam}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                !exam
                  ? 'opacity-40 cursor-not-allowed text-slate-400'
                  : activeViewTab === 'exam'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Practice Exam</span>
              {exam && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </button>
          </div>

          {(summary || exam) && (
            <button
              onClick={onOpenExport}
              title="Export Study Material"
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Chat Thread Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 overflow-y-auto no-scrollbar relative bg-white ${
          isDragOver ? 'bg-sky-50/50 ring-2 ring-sky-400 ring-inset' : ''
        }`}
      >
        {/* Full-screen Drag Overlay indicator */}
        {isDragOver && (
          <div className="absolute inset-0 z-30 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center pointer-events-none">
            <UploadCloud className="w-16 h-16 text-sky-600 animate-bounce mb-3" />
            <h3 className="text-xl font-bold text-slate-900">Drop your notes or PDF here!</h3>
            <p className="text-xs text-slate-600 mt-1">
              Supports .pdf, .txt, .md, .docx, and audio lecture recordings (.mp3, .wav)
            </p>
          </div>
        )}

        {/* Empty State / Welcome Screen */}
        {messages.length === 0 ? (
          <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col items-center text-center space-y-8">
            <div className="space-y-3">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 p-0.5 shadow-xl shadow-sky-500/20">
                <div className="h-full w-full bg-white rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-sky-600" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                What notes are we studying today?
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto">
                Paste your notes, upload a PDF or lecture audio, or speak with your microphone.
                Gemini studies your content first, then crafts high-yield summaries and practice exams.
              </p>
            </div>

            {/* Drag & Drop File Upload Card */}
            <input
              ref={dragDropInputRef}
              type="file"
              accept=".txt,.md,.pdf,.docx,.json,.mp3,.wav,.m4a"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) processDroppedFile(f);
              }}
              className="hidden"
            />
            <div
              onClick={() => dragDropInputRef.current?.click()}
              className="w-full max-w-xl p-8 rounded-2xl border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/40 hover:bg-sky-50/80 cursor-pointer transition-all flex flex-col items-center group shadow-xs"
            >
              <div className="h-12 w-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-900">
                Upload Lecture Notes or PDF
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Drag and drop your file here, or browse files (.pdf, .txt, .md, .mp3)
              </p>
              <div className="flex items-center gap-4 mt-4 text-[11px] text-slate-600">
                <span className="flex items-center gap-1 font-medium">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-rose-500" /> PDF Document
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <FileText className="w-3.5 h-3.5 text-sky-600" /> Text / Markdown
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Headphones className="w-3.5 h-3.5 text-emerald-600" /> Audio Recording
                </span>
              </div>
            </div>

            {/* Quick Starter Chips */}
            <div className="w-full max-w-xl space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Or start with sample lecture notes:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {SAMPLE_NOTES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => onLoadPreset(sample)}
                    className="p-3.5 rounded-xl bg-white hover:bg-sky-50/80 border border-slate-200 hover:border-sky-300 text-xs transition-all group flex items-start gap-2.5 shadow-2xs"
                  >
                    <BookOpen className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900 group-hover:text-sky-900 block">
                        {sample.title}
                      </span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">
                        {sample.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Message List */
          <div className="divide-y divide-slate-100 pb-6">
            {messages.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                onOpenSummary={onOpenSummary}
                onOpenExam={onOpenExam}
                onOpenFlashcards={onOpenFlashcards}
                onSpeak={speak}
                onStopSpeak={stopSpeaking}
                isSpeakingThis={isSpeaking && playingId === msg.id}
                isGeneratingTTSThis={isGeneratingTTS && playingId === msg.id}
              />
            ))}

            {isLoading && (
              <div className="py-6 px-4 sm:px-6 bg-sky-50/40 border-y border-sky-100/60">
                <div className="max-w-3xl mx-auto flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 via-sky-400 to-blue-600 p-0.5 shadow-md shadow-sky-500/20 shrink-0">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-sky-600 animate-spin" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-900 tracking-tight">
                      Google Gemini is studying your notes...
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-sky-700">
                      <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce delay-100" />
                      <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce delay-200" />
                      <span className="ml-1 text-slate-600">
                        Analyzing concepts, identifying high-yield traps & calibrating exam questions...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Floating Input Bar */}
      <ChatInputBar
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        isListening={isListening}
        onStartListening={() => {
          startListening((text) => {
            onSendMessage(text);
          });
        }}
        onStopListening={stopListening}
        interimTranscript={interimTranscript}
        hasNotesInContext={messages.length > 0}
        onQuickAction={onQuickAction}
      />
    </div>
  );
};
