import React, { useState, useEffect } from 'react';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatWorkspace } from './components/ChatWorkspace';
import { SummaryView } from './components/SummaryView';
import { FlashcardsView } from './components/FlashcardsView';
import { ExamView } from './components/ExamView';
import { ExportModal } from './components/ExportModal';
import { StudyTutorModal } from './components/StudyTutorModal';
import { SAMPLE_NOTES, SampleNote } from './data/sampleNotes';
import { useSpeech } from './utils/useSpeech';
import {
  StudySession,
  ChatMessage,
  StudySummary,
  PracticeExam,
  AcademicLevel,
  ExamDifficulty,
  AttachedFile,
  ExamQuestion,
} from './types';

const STORAGE_KEY = 'examprep_ai_sessions_v2';

export default function App() {
  const [sessions, setSessions] = useState<StudySession[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load sessions from localStorage', e);
    }
    // Default initial session with biology preset
    const defaultSample = SAMPLE_NOTES[0];
    return [
      {
        id: 'session-default',
        title: defaultSample.title,
        createdAt: Date.now(),
        lastModified: Date.now(),
        notes: defaultSample.content,
        subject: defaultSample.subject,
        academicLevel: defaultSample.academicLevel as AcademicLevel,
        difficulty: 'balanced',
        questionCount: 8,
        summary: null,
        exam: null,
        messages: [
          {
            id: 'welcome-msg',
            role: 'assistant',
            content: `👋 Welcome to ExamPrep AI!\n\nI've loaded notes on **${defaultSample.title}** to get you started immediately.\n\nYou can:\n- Click **"✨ Summarize Notes"** below to generate an executive synthesis, key concepts & cram sheet.\n- Click **"🎯 Generate Practice Exam"** to create realistic exam questions with instant AI scoring.\n- Click the 📎 paperclip to **upload your own PDF or notes**.\n- Click the 🎙️ mic to **dictate notes or questions using Speech-to-Text**.\n- Click the 🔊 speaker on any answer to **listen with Text-to-Speech**!`,
            timestamp: Date.now(),
          },
        ],
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || 'session-default';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'chat' | 'summary' | 'flashcards' | 'exam'>('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);
  const [tutorInitialQuery, setTutorInitialQuery] = useState('');

  // Speech Hook (TTS + STT)
  const speech = useSpeech({ voice: selectedVoice });

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save sessions to localStorage', e);
    }
  }, [sessions]);

  // Active session
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const updateActiveSession = (updates: Partial<StudySession>) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, ...updates, lastModified: Date.now() } : s))
    );
  };

  // Start new session
  const handleNewSession = () => {
    speech.stopSpeaking();
    speech.stopListening();
    const newId = `session-${Date.now()}`;
    const newSession: StudySession = {
      id: newId,
      title: 'New Study Session',
      createdAt: Date.now(),
      lastModified: Date.now(),
      notes: '',
      subject: '',
      academicLevel: 'Undergraduate / College',
      difficulty: 'balanced',
      questionCount: 8,
      summary: null,
      exam: null,
      messages: [],
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
    setActiveViewTab('chat');
    setIsSidebarOpen(false);
  };

  // Delete session
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = sessions.filter((s) => s.id !== id);
    if (remaining.length === 0) {
      handleNewSession();
    } else {
      setSessions(remaining);
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0].id);
      }
    }
  };

  // Load a preset sample note
  const handleLoadPreset = (sample: SampleNote) => {
    speech.stopSpeaking();
    const newId = `session-${Date.now()}`;
    const newSession: StudySession = {
      id: newId,
      title: sample.title,
      createdAt: Date.now(),
      lastModified: Date.now(),
      notes: sample.content,
      subject: sample.subject,
      academicLevel: sample.academicLevel as AcademicLevel,
      difficulty: 'balanced',
      questionCount: 8,
      summary: null,
      exam: null,
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `Loaded **${sample.title}** (${sample.subject}).\n\n${sample.description}\n\nClick **"✨ Summarize Notes"** or **"🎯 Generate Practice Exam"** below to analyze these notes!`,
          timestamp: Date.now(),
        },
      ],
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
    setActiveViewTab('chat');
    setIsSidebarOpen(false);
  };

  // Process User Send Message
  const handleSendMessage = async (text: string, attachedFile?: AttachedFile) => {
    if (!text.trim() && !attachedFile) return;

    // Check if this is an audio file transcription request
    let audioTranscript: string | null = null;
    if (attachedFile?.isAudio && attachedFile.base64) {
      setIsLoading(true);
      try {
        const transRes = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: attachedFile.base64,
            mimeType: attachedFile.type,
          }),
        });
        if (transRes.ok) {
          const transData = await transRes.json();
          audioTranscript = transData.transcript;
        }
      } catch (err) {
        console.warn('Audio transcribe failed', err);
      }
    }

    const effectiveText = audioTranscript
      ? `${text ? text + '\n\n' : ''}[Transcribed Lecture Audio]:\n${audioTranscript}`
      : text;

    // Append user message
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: effectiveText || (attachedFile ? `Uploaded ${attachedFile.name}` : ''),
      timestamp: Date.now(),
      attachedFile,
    };

    // Update session title if first message
    let sessionTitle = activeSession.title;
    if (activeSession.title === 'New Study Session') {
      if (attachedFile) {
        sessionTitle = attachedFile.name.replace(/\.[^/.]+$/, '');
      } else if (text.length > 5) {
        sessionTitle = text.slice(0, 32) + (text.length > 32 ? '...' : '');
      }
    }

    // Accumulate notes
    let updatedNotes = activeSession.notes;
    if (attachedFile?.text) {
      updatedNotes = attachedFile.text;
    } else if (audioTranscript) {
      updatedNotes = audioTranscript;
    } else if (text.length > 80) {
      updatedNotes = text;
    }

    const updatedMessages = [...activeSession.messages, userMsg];
    updateActiveSession({
      notes: updatedNotes,
      title: sessionTitle,
      messages: updatedMessages,
    });

    setIsLoading(true);

    try {
      // Determine what to trigger:
      // If prompt specifically asks for exam or question
      const lower = text.toLowerCase();
      const wantsExam =
        lower.includes('exam') ||
        lower.includes('quiz') ||
        lower.includes('question') ||
        lower.includes('test me');
      const wantsSummary =
        lower.includes('summar') ||
        lower.includes('key point') ||
        lower.includes('cram') ||
        lower.includes('overview') ||
        lower.includes('flashcard');

      if (wantsExam && !wantsSummary) {
        // Trigger Exam generation
        await triggerExamGeneration(updatedNotes, attachedFile, updatedMessages);
      } else if (wantsSummary && !wantsExam) {
        // Trigger Summary generation
        await triggerSummaryGeneration(updatedNotes, attachedFile, updatedMessages);
      } else if (attachedFile || lower.includes('all') || lower.includes('both')) {
        // Generate both for file uploads or complete requests
        await triggerBothGenerations(updatedNotes, attachedFile, updatedMessages);
      } else {
        // Standard conversational tutor inquiry
        await triggerTutorResponse(text, updatedNotes, updatedMessages);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I ran into an issue processing that request. Please try again or rephrase your question.`,
        timestamp: Date.now(),
      };
      updateActiveSession({
        messages: [...updatedMessages, errorMsg],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: Deep Study & Diagnosis First
  const fetchDiagnosis = async (
    notesContent: string,
    attachedFile: AttachedFile | undefined
  ) => {
    try {
      const res = await fetch('/api/study-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: notesContent,
          subject: activeSession.subject,
          fileBase64: attachedFile?.isPdf ? attachedFile.base64 : undefined,
          fileMimeType: attachedFile?.type,
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Diagnosis fetch failed, continuing with fallback:', e);
    }
    return null;
  };

  // Helper: Trigger Summary Generation (grounded in diagnosis)
  const triggerSummaryGeneration = async (
    notesContent: string,
    attachedFile: AttachedFile | undefined,
    currentMessages: ChatMessage[]
  ) => {
    // Phase 1: Study & diagnose first
    const diagData = await fetchDiagnosis(notesContent, attachedFile);

    // Phase 2: Formulate tailored summary
    const res = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes: notesContent,
        subject: diagData?.subject || activeSession.subject,
        academicLevel: activeSession.academicLevel,
        fileBase64: attachedFile?.isPdf ? attachedFile.base64 : undefined,
        fileMimeType: attachedFile?.type,
      }),
    });

    const summaryData: StudySummary = await res.json();
    if (diagData) {
      summaryData.diagnosis = diagData;
    }

    const assistantMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: `🧠 **Google Gemini Study Analysis Complete**\n\nI have studied your notes and mapped the subject as **${summaryData.subject || 'Academic Study Set'} — ${summaryData.title}**.\n\n### What This Is About:\n${diagData?.whatItIsAbout || summaryData.executiveSummary.slice(0, 200) + '...'}\n\n### Tailored Study Summary:\nSynthesized **${summaryData.keyConcepts?.length || 4} key concepts**, high-yield topic breakdowns, a **1-page cram sheet**, and **${summaryData.flashcards?.length || 6} active recall flashcards**.`,
      timestamp: Date.now(),
      diagnosis: diagData || undefined,
      summary: summaryData,
    };

    updateActiveSession({
      diagnosis: diagData,
      summary: summaryData,
      title: summaryData.title || activeSession.title,
      messages: [...currentMessages, assistantMsg],
    });
  };

  // Helper: Trigger Exam Generation (grounded in diagnosis)
  const triggerExamGeneration = async (
    notesContent: string,
    attachedFile: AttachedFile | undefined,
    currentMessages: ChatMessage[]
  ) => {
    // Phase 1: Study & diagnose first
    const diagData = await fetchDiagnosis(notesContent, attachedFile);

    // Phase 2: Formulate exam questions targeting traps & high-yield areas
    const res = await fetch('/api/generate-exam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes: notesContent,
        questionCount: activeSession.questionCount || 8,
        difficulty: activeSession.difficulty || 'balanced',
        academicLevel: activeSession.academicLevel,
        fileBase64: attachedFile?.isPdf ? attachedFile.base64 : undefined,
        fileMimeType: attachedFile?.type,
      }),
    });

    const examData: PracticeExam = await res.json();
    if (diagData) {
      examData.diagnosis = diagData;
    }

    const assistantMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: `🎯 **Practice Exam Calibrated by Google Gemini**\n\nBased on studying your notes on **${examData.examTitle}**, Gemini mapped the core focus areas and student traps:\n\n- **Target Focus:** ${diagData?.highYieldExamFocus || 'Core regulatory mechanisms and definitions'}\n- **Exam Strategy:** ${diagData?.recommendedQuestionStrategy || 'Multiple-choice questions with plausible distractors and conceptual essay prompts'}\n\nClick **"Start Practice Exam"** below to take the timed quiz with instant AI grading on your written answers!`,
      timestamp: Date.now(),
      diagnosis: diagData || undefined,
      exam: examData,
    };

    updateActiveSession({
      diagnosis: diagData,
      exam: examData,
      title: examData.examTitle || activeSession.title,
      messages: [...currentMessages, assistantMsg],
    });
  };

  // Helper: Trigger Both
  const triggerBothGenerations = async (
    notesContent: string,
    attachedFile: AttachedFile | undefined,
    currentMessages: ChatMessage[]
  ) => {
    // Phase 1: Study & diagnose first
    const diagData = await fetchDiagnosis(notesContent, attachedFile);

    // Phase 2: Generate summary and exam in parallel
    const [sumRes, examRes] = await Promise.all([
      fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: notesContent,
          subject: diagData?.subject || activeSession.subject,
          academicLevel: activeSession.academicLevel,
          fileBase64: attachedFile?.isPdf ? attachedFile.base64 : undefined,
          fileMimeType: attachedFile?.type,
        }),
      }),
      fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: notesContent,
          questionCount: activeSession.questionCount || 8,
          difficulty: activeSession.difficulty || 'balanced',
          academicLevel: activeSession.academicLevel,
          fileBase64: attachedFile?.isPdf ? attachedFile.base64 : undefined,
          fileMimeType: attachedFile?.type,
        }),
      }),
    ]);

    const sumData: StudySummary = await sumRes.json();
    const examData: PracticeExam = await examRes.json();

    if (diagData) {
      sumData.diagnosis = diagData;
      examData.diagnosis = diagData;
    }

    const assistantMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: `✨ **Complete Study Toolkit Generated by Google Gemini**\n\nGemini has studied your material and formulated:\n1. **Deep Subject Diagnosis & Scope Analysis**\n2. **High-Yield Summary, 1-Page Cram Sheet & ${sumData.flashcards?.length || 6} Flashcards**\n3. **Practice Exam (${examData.questions?.length} Questions)** with live timer and AI scoring\n\n### What This Note Is About:\n${diagData?.whatItIsAbout || sumData.executiveSummary}`,
      timestamp: Date.now(),
      diagnosis: diagData || undefined,
      summary: sumData,
      exam: examData,
    };

    updateActiveSession({
      diagnosis: diagData,
      summary: sumData,
      exam: examData,
      title: sumData.title || activeSession.title,
      messages: [...currentMessages, assistantMsg],
    });
  };

  // Helper: Conversational Tutor Response
  const triggerTutorResponse = async (
    userText: string,
    notesContent: string,
    currentMessages: ChatMessage[]
  ) => {
    const res = await fetch('/api/ask-tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes: notesContent,
        question: userText,
        chatHistory: currentMessages.slice(-4).map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          text: m.content,
        })),
      }),
    });

    const data = await res.json();
    let text = data.answer;
    if (data.keyTakeaway) {
      text += `\n\n💡 **Key Takeaway:** ${data.keyTakeaway}`;
    }

    const assistantMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: text,
      timestamp: Date.now(),
    };

    updateActiveSession({
      messages: [...currentMessages, assistantMsg],
    });
  };

  // Quick Action from input bar
  const handleQuickAction = (actionType: 'summarize' | 'exam' | 'flashcards' | 'all') => {
    const notesToUse = activeSession.notes || SAMPLE_NOTES[0].content;
    if (actionType === 'summarize') {
      handleSendMessage('Please summarize these notes and give me key concepts, takeaways, and flashcards.');
    } else if (actionType === 'exam') {
      handleSendMessage('Generate a rigorous practice exam with multiple choice and conceptual questions based on these notes.');
    } else if (actionType === 'flashcards') {
      if (activeSession.summary?.flashcards?.length) {
        setActiveViewTab('flashcards');
      } else {
        handleSendMessage('Create active recall flashcards for this topic.');
      }
    } else if (actionType === 'all') {
      handleSendMessage('Generate the complete study toolkit: high-yield summary, flashcards, and a practice exam.');
    }
  };

  const handleAskTutorAboutConcept = (concept: string) => {
    setTutorInitialQuery(`Can you explain "${concept}" in detail with an intuitive analogy?`);
    setIsTutorModalOpen(true);
  };

  const handleAskTutorAboutQuestion = (q: ExamQuestion) => {
    setTutorInitialQuery(
      `I'm studying this exam question: "${q.question}". Can you explain how to think through it step-by-step?`
    );
    setIsTutorModalOpen(true);
  };

  return (
    <div className="flex h-screen w-full bg-white text-slate-800 overflow-hidden font-sans">
      {/* ChatGPT Sidebar */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          setActiveSessionId(id);
          setIsSidebarOpen(false);
          setActiveViewTab('chat');
        }}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onLoadPreset={handleLoadPreset}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        academicLevel={activeSession.academicLevel}
        setAcademicLevel={(lvl) => updateActiveSession({ academicLevel: lvl })}
        difficulty={activeSession.difficulty}
        setDifficulty={(diff) => updateActiveSession({ difficulty: diff })}
        selectedVoice={selectedVoice}
        setSelectedVoice={setSelectedVoice}
        questionCount={activeSession.questionCount || 8}
        setQuestionCount={(cnt) => updateActiveSession({ questionCount: cnt })}
      />

      {/* Main Content Area (Shifted right on desktop) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden lg:pl-72 transition-all bg-white">
        {/* Workspace Views */}
        {activeViewTab === 'chat' && (
          <ChatWorkspace
            sessionTitle={activeSession.title}
            messages={activeSession.messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            activeViewTab={activeViewTab}
            setActiveViewTab={setActiveViewTab}
            summary={activeSession.summary}
            exam={activeSession.exam}
            onOpenSummary={() => setActiveViewTab('summary')}
            onOpenExam={() => setActiveViewTab('exam')}
            onOpenFlashcards={() => setActiveViewTab('flashcards')}
            onOpenExport={() => setIsExportOpen(true)}
            onLoadPreset={handleLoadPreset}
            isSpeaking={speech.isSpeaking}
            isGeneratingTTS={speech.isGeneratingTTS}
            playingId={speech.playingId}
            speak={speech.speak}
            stopSpeaking={speech.stopSpeaking}
            isListening={speech.isListening}
            interimTranscript={speech.interimTranscript}
            startListening={speech.startListening}
            stopListening={speech.stopListening}
            onQuickAction={handleQuickAction}
          />
        )}

        {activeViewTab === 'summary' && activeSession.summary && (
          <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/40">
            {/* Sticky Navigation Bar */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-3 border-b border-sky-100 shadow-xs flex items-center justify-between">
              <button
                onClick={() => setActiveViewTab('chat')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1.5 transition-colors"
              >
                <span>← Back to Study Chat</span>
              </button>
              <div className="flex items-center gap-2">
                {/* Audio Read Summary Button */}
                <button
                  onClick={() =>
                    speech.speak(
                      `${activeSession.summary!.title}. ${activeSession.summary!.executiveSummary}`,
                      'summary-audio'
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 transition-colors shadow-xs"
                >
                  <span>{speech.playingId === 'summary-audio' && speech.isSpeaking ? '⏹ Stop Audio' : '🔊 Listen to Summary'}</span>
                </button>
                <button
                  onClick={() => setIsExportOpen(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
                >
                  Export
                </button>
              </div>
            </div>

            <SummaryView
              summary={activeSession.summary}
              onGoToExam={() => {
                if (activeSession.exam) {
                  setActiveViewTab('exam');
                } else {
                  handleSendMessage('Please generate practice exam questions for these notes.');
                }
              }}
              onGoToFlashcards={() => setActiveViewTab('flashcards')}
              onAskTutorAboutConcept={handleAskTutorAboutConcept}
            />
          </div>
        )}

        {activeViewTab === 'flashcards' && activeSession.summary && (
          <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/40">
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-3 border-b border-sky-100 shadow-xs flex items-center justify-between">
              <button
                onClick={() => setActiveViewTab('chat')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1.5 transition-colors"
              >
                <span>← Back to Study Chat</span>
              </button>
              <span className="text-xs font-medium text-slate-500">
                {activeSession.summary.flashcards.length} Flashcards in Deck
              </span>
            </div>

            <FlashcardsView cards={activeSession.summary.flashcards} />
          </div>
        )}

        {activeViewTab === 'exam' && activeSession.exam && (
          <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/40">
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-3 border-b border-sky-100 shadow-xs flex items-center justify-between">
              <button
                onClick={() => setActiveViewTab('chat')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1.5 transition-colors"
              >
                <span>← Back to Study Chat</span>
              </button>
              <button
                onClick={() => setIsExportOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
              >
                Export Exam Paper
              </button>
            </div>

            <ExamView
              exam={activeSession.exam}
              onRetakeExam={() => {
                updateActiveSession({ exam: { ...activeSession.exam! } });
              }}
              onAskTutorAboutQuestion={handleAskTutorAboutQuestion}
            />
          </div>
        )}
      </div>

      {/* Study Tutor Side Drawer/Modal */}
      <StudyTutorModal
        isOpen={isTutorModalOpen}
        onClose={() => setIsTutorModalOpen(false)}
        notes={activeSession.notes}
        initialQuestion={tutorInitialQuery}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        summary={activeSession.summary}
        exam={activeSession.exam}
      />
    </div>
  );
}
