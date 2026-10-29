import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Sparkles,
  BookOpen,
  Trash2,
  Sliders,
  Volume2,
  GraduationCap,
  ChevronLeft,
  ChevronDown,
} from 'lucide-react';
import { StudySession, AcademicLevel, ExamDifficulty } from '../types';
import { SAMPLE_NOTES, SampleNote } from '../data/sampleNotes';

interface ChatSidebarProps {
  sessions: StudySession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onLoadPreset: (sample: SampleNote) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  academicLevel: AcademicLevel;
  setAcademicLevel: (level: AcademicLevel) => void;
  difficulty: ExamDifficulty;
  setDifficulty: (diff: ExamDifficulty) => void;
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  questionCount: number;
  setQuestionCount: (count: number) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onLoadPreset,
  isOpen,
  onToggleOpen,
  academicLevel,
  setAcademicLevel,
  difficulty,
  setDifficulty,
  selectedVoice,
  setSelectedVoice,
  questionCount,
  setQuestionCount,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggleOpen}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-50/95 border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="p-3.5 border-b border-slate-200/80 bg-white/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5 px-1.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 p-0.5 shadow-md shadow-sky-500/20">
              <div className="h-full w-full bg-white rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-sky-600" />
              </div>
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 tracking-tight">ExamPrep AI</span>
              <span className="block text-[10px] text-sky-700 font-medium">Notes & Exam Engine</span>
            </div>
          </div>

          <button
            onClick={onToggleOpen}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* New Session Button */}
        <div className="p-3">
          <button
            onClick={onNewSession}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white hover:bg-sky-50/80 border border-sky-200/90 text-xs font-semibold text-slate-800 shadow-xs hover:border-sky-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <Plus className="w-4 h-4 text-sky-600 group-hover:rotate-90 transition-transform" />
              <span>New Note Session</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">⌘N</span>
          </button>
        </div>

        {/* Middle scrollable area: Recent Sessions & Presets */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2 space-y-4">
          {/* Preset Notes Section */}
          <div>
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1 hover:text-sky-700"
            >
              <span>Sample Note Presets</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showPresets ? 'rotate-180' : ''}`}
              />
            </button>

            {showPresets && (
              <div className="mt-1 space-y-1">
                {SAMPLE_NOTES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => onLoadPreset(sample)}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs bg-white/70 hover:bg-sky-50 border border-slate-200/70 hover:border-sky-200 transition-all flex items-center gap-2 group shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <div className="overflow-hidden">
                      <span className="text-slate-800 group-hover:text-sky-900 font-medium truncate block">
                        {sample.title}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {sample.subject.split('/')[0]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Recent Study Sessions List */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 block mb-1.5">
              Study Sessions ({sessions.length})
            </span>

            <div className="space-y-1">
              {sessions.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400 italic">
                  No previous sessions. Start by pasting notes or uploading a file!
                </div>
              ) : (
                sessions.map((session) => {
                  const isActive = session.id === activeSessionId;
                  return (
                    <div
                      key={session.id}
                      onClick={() => onSelectSession(session.id)}
                      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                        isActive
                          ? 'bg-sky-100/90 text-sky-950 border border-sky-300 font-semibold shadow-2xs'
                          : 'text-slate-700 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden pr-2">
                        <MessageSquare
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isActive ? 'text-sky-600' : 'text-slate-400'
                          }`}
                        />
                        <span className="truncate">{session.title || 'Untitled Session'}</span>
                      </div>

                      <button
                        onClick={(e) => onDeleteSession(session.id, e)}
                        title="Delete session"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Bottom Configuration & Audio Voice Panel */}
        <div className="border-t border-slate-200/90 p-3 space-y-2 bg-white/80">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-sky-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-sky-600" />
              <span>Exam & Voice Settings</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showSettings ? 'rotate-180' : ''}`}
            />
          </button>

          {showSettings && (
            <div className="p-3 bg-white border border-sky-150 rounded-xl space-y-3 text-xs shadow-xs">
              {/* Voice Selection for TTS */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Text-to-Speech Voice</span>
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none text-[11px] focus:border-sky-400"
                >
                  <option value="Kore">Kore (Articulate Professor)</option>
                  <option value="Puck">Puck (Energetic Tutor)</option>
                  <option value="Charon">Charon (Deep & Calm)</option>
                  <option value="Fenrir">Fenrir (Authoritative)</option>
                  <option value="Zephyr">Zephyr (Gentle & Clear)</option>
                </select>
              </div>

              {/* Academic Level */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-sky-600" />
                  <span>Academic Level</span>
                </label>
                <select
                  value={academicLevel}
                  onChange={(e) => setAcademicLevel(e.target.value as AcademicLevel)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none text-[11px] focus:border-sky-400"
                >
                  <option value="High School">High School</option>
                  <option value="Undergraduate / College">Undergraduate / College</option>
                  <option value="Graduate / Professional">Graduate / Professional</option>
                  <option value="Competitive Exams (MCAT / USMLE / Bar / GRE)">
                    Competitive (MCAT / Bar)
                  </option>
                </select>
              </div>

              {/* Exam Question Count */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-slate-700">Question Count</span>
                  <span className="font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">{questionCount} Qs</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={15}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              {/* Exam Difficulty */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Exam Rigor</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'balanced', label: 'Balanced' },
                    { id: 'challenging', label: 'Challenging' },
                    { id: 'mastery', label: 'Mastery' },
                    { id: 'easy', label: 'Easy' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDifficulty(d.id as ExamDifficulty)}
                      className={`py-1 px-2 rounded-lg border text-[10px] font-medium transition-colors ${
                        difficulty === d.id
                          ? 'bg-sky-100 border-sky-400 text-sky-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-sky-50/50'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Model badge */}
          <div className="px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Gemini 3.8 Flash</span>
            </span>
            <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">Active</span>
          </div>
        </div>
      </aside>
    </>
  );
};
