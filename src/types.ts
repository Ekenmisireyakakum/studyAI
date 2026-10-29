export type AcademicLevel =
  | 'High School'
  | 'Undergraduate / College'
  | 'Graduate / Professional'
  | 'Competitive Exams (MCAT / USMLE / Bar / GRE)';

export type ExamDifficulty = 'easy' | 'balanced' | 'challenging' | 'mastery';

export type QuestionType = 'mcq' | 'short_answer' | 'essay';

export interface NoteDiagnosis {
  subject: string;
  topic: string;
  whatItIsAbout: string;
  academicLevelDetected: string;
  cognitiveDepth: string;
  coreThemes: string[];
  highYieldExamFocus: string;
  identifiedMisconceptions: string[];
  recommendedQuestionStrategy: string;
}

export interface KeyConcept {
  term: string;
  definition: string;
  significance: string;
  mnemonicOrAnalogy?: string;
}

export interface SectionBreakdown {
  heading: string;
  summary: string;
  bulletPoints: string[];
  commonPitfalls?: string;
}

export interface Flashcard {
  front: string;
  back: string;
  category: string;
}

export interface StudySummary {
  title: string;
  subject: string;
  estimatedReadingTimeMinutes: number;
  executiveSummary: string;
  diagnosis?: NoteDiagnosis;
  keyConcepts: KeyConcept[];
  sectionBreakdowns: SectionBreakdown[];
  cheatSheet: string[];
  flashcards: Flashcard[];
}

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  question: string;
  options?: string[]; // for mcq
  correctOptionIndex?: number;
  correctAnswer: string;
  explanation: string;
  rubric?: string[]; // for short answer / essay
  modelAnswer?: string;
  commonMistake?: string;
}

export interface PracticeExam {
  examTitle: string;
  estimatedDurationMinutes: number;
  difficulty: string;
  totalPoints: number;
  instructions: string;
  diagnosis?: NoteDiagnosis;
  questions: ExamQuestion[];
}

export interface AnswerEvaluation {
  score: number;
  gradeLetter: string;
  feedbackSummary: string;
  strengths: string[];
  missingPoints: string[];
  improvementAdvice: string;
}

export interface StudentAnswerState {
  selectedOptionIndex?: number;
  writtenAnswer?: string;
  isAnswered: boolean;
  evaluation?: AnswerEvaluation;
  evaluating?: boolean;
}

export interface TutorMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  keyTakeaway?: string;
  followUpExamQuestions?: string[];
  timestamp: number;
}

export interface AttachedFile {
  name: string;
  size: number;
  type: string;
  base64?: string;
  text?: string;
  isAudio?: boolean;
  isPdf?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachedFile?: AttachedFile;
  diagnosis?: NoteDiagnosis;
  summary?: StudySummary;
  exam?: PracticeExam;
  isGenerating?: boolean;
  isVoiceInput?: boolean;
}

export interface StudySession {
  id: string;
  title: string;
  createdAt: number;
  lastModified: number;
  notes: string;
  subject: string;
  academicLevel: AcademicLevel;
  difficulty: ExamDifficulty;
  questionCount: number;
  diagnosis?: NoteDiagnosis | null;
  summary: StudySummary | null;
  exam: PracticeExam | null;
  messages: ChatMessage[];
}
