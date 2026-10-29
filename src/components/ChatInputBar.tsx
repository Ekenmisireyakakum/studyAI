import React, { useRef, useState, useEffect } from 'react';
import {
  ArrowUp,
  Paperclip,
  Mic,
  MicOff,
  X,
  FileText,
  FileSpreadsheet,
  Headphones,
  Sparkles,
  Zap,
  Award,
  BookOpen,
} from 'lucide-react';
import { AttachedFile } from '../types';

interface ChatInputBarProps {
  onSendMessage: (text: string, attachedFile?: AttachedFile) => void;
  isLoading: boolean;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  interimTranscript?: string;
  hasNotesInContext: boolean;
  onQuickAction: (actionType: 'summarize' | 'exam' | 'flashcards' | 'all') => void;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSendMessage,
  isLoading,
  isListening,
  onStartListening,
  onStopListening,
  interimTranscript,
  hasNotesInContext,
  onQuickAction,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isAudio = file.type.startsWith('audio/') || /\.(mp3|wav|m4a|webm|ogg)$/i.test(file.name);
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

    const reader = new FileReader();

    if (isPdf || isAudio) {
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        setAttachedFile({
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
        setAttachedFile({
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

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = () => {
    const textToSend = inputText.trim() || (interimTranscript ? interimTranscript.trim() : '');
    if ((!textToSend && !attachedFile) || isLoading) return;

    if (isListening) {
      onStopListening();
    }

    onSendMessage(textToSend, attachedFile || undefined);
    setInputText('');
    setAttachedFile(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4">
      {/* Quick Action Suggestion Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-2 pb-1 text-xs no-scrollbar">
        <button
          onClick={() => onQuickAction('summarize')}
          disabled={isLoading}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-sky-50/90 border border-sky-200 text-slate-700 hover:text-sky-800 transition-all shadow-2xs font-medium"
        >
          <BookOpen className="w-3.5 h-3.5 text-sky-600" />
          <span>✨ Summarize Notes</span>
        </button>

        <button
          onClick={() => onQuickAction('exam')}
          disabled={isLoading}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-sky-50/90 border border-sky-200 text-slate-700 hover:text-sky-800 transition-all shadow-2xs font-medium"
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>🎯 Generate Practice Exam</span>
        </button>

        <button
          onClick={() => onQuickAction('flashcards')}
          disabled={isLoading}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-sky-50/90 border border-sky-200 text-slate-700 hover:text-sky-800 transition-all shadow-2xs font-medium"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>🗂️ Generate Flashcards</span>
        </button>

        <button
          onClick={() => onQuickAction('all')}
          disabled={isLoading}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-800 transition-all shadow-2xs font-semibold"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>⚡ Full Study Toolkit</span>
        </button>
      </div>

      {/* Main Input Box (ChatGPT Container) in Crisp White with Light Blue Accent */}
      <div className="relative rounded-2xl bg-white border border-sky-200/90 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 shadow-lg shadow-sky-100/60 transition-all p-2.5">
        {/* Attached File Preview Pill */}
        {attachedFile && (
          <div className="mb-2 flex items-center gap-2 p-2 rounded-xl bg-sky-50 border border-sky-200 w-fit max-w-full">
            <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
              {attachedFile.isAudio ? (
                <Headphones className="w-4 h-4 text-emerald-600" />
              ) : attachedFile.isPdf ? (
                <FileSpreadsheet className="w-4 h-4 text-rose-500" />
              ) : (
                <FileText className="w-4 h-4 text-sky-600" />
              )}
            </div>
            <div className="text-xs overflow-hidden pr-2">
              <span className="font-semibold text-slate-800 block truncate max-w-xs">
                {attachedFile.name}
              </span>
              <span className="text-[10px] text-slate-500">
                {formatFileSize(attachedFile.size)} •{' '}
                {attachedFile.isAudio
                  ? 'Audio Lecture Recording'
                  : attachedFile.isPdf
                  ? 'PDF Study Document'
                  : 'Text Notes'}
              </span>
            </div>
            <button
              onClick={() => setAttachedFile(null)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-sky-100 transition-colors ml-auto"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Listening Active Banner */}
        {isListening && (
          <div className="mb-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-medium">Listening... Speak your notes or exam question</span>
            </div>
            <button
              onClick={onStopListening}
              className="text-[11px] font-bold underline hover:text-rose-900"
            >
              Done Speaking
            </button>
          </div>
        )}

        {/* Text Area and Action Buttons Row */}
        <div className="flex items-end gap-2">
          {/* File Upload Button (Paperclip) */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.pdf,.docx,.json,.csv,.mp3,.wav,.m4a,.webm"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach Notes File (PDF, TXT, MD, or Audio Lecture)"
            className="p-2.5 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : 'Paste notes, upload a PDF, or ask anything about your exam...'
            }
            rows={1}
            className="flex-1 max-h-44 bg-transparent border-0 text-slate-800 placeholder:text-slate-400 text-sm focus:ring-0 focus:outline-none resize-none py-2 px-1 leading-relaxed"
          />

          {/* Speech-to-Text Microphone Button */}
          <button
            type="button"
            onClick={() => {
              if (isListening) {
                onStopListening();
              } else {
                onStartListening();
              }
            }}
            title={isListening ? 'Stop Listening' : 'Speak / Dictate Notes (Speech-to-Text)'}
            className={`p-2.5 rounded-xl transition-all shrink-0 ${
              isListening
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-105 animate-pulse'
                : 'text-slate-500 hover:text-sky-600 hover:bg-sky-50'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Send Button in vibrant Light Blue */}
          <button
            type="button"
            onClick={handleSend}
            disabled={(!inputText.trim() && !attachedFile) || isLoading}
            className={`p-2.5 rounded-xl font-semibold transition-all shrink-0 ${
              (!inputText.trim() && !attachedFile) || isLoading
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/25 active:scale-95'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowUp className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div className="text-center mt-2">
        <span className="text-[11px] text-slate-500 font-medium">
          Tip: Drop a PDF or speak directly. ExamPrep AI summarizes notes and generates practice exam questions with AI grading.
        </span>
      </div>
    </div>
  );
};
