import type {
  SolutionStep,
  AlternativeMethod,
  QuizQuestion,
  StudyPlanTask,
} from '../../../src/types/index.ts';

export type {
  SolutionStep,
  AlternativeMethod,
  QuizQuestion,
  StudyPlanTask,
};

export interface SolveQuestionInput {
  questionText?: string;
  imageBase64?: string;
  mimeType?: string;
  preferredLanguage?: 'en' | 'ur';
}

export interface SolveQuestionResult {
  subject: string;
  topic: string;
  questionText: string;
  steps: SolutionStep[];
  finalAnswer: string;
  explanation: string;
  urduExplanation: string;
  simplerExplanation: string;
  alternativeMethod: AlternativeMethod;
  similarPracticeQuestion: {
    question: string;
    hint: string;
    answer: string;
    explanation: string;
  };
}

export interface ChatTutorInput {
  message: string;
  history: Array<{ sender: 'user' | 'solvo'; text: string }>;
  language: 'en' | 'ur';
}

export interface ChatTutorResult {
  text: string;
  language: 'en' | 'ur';
  quickActions: string[];
}

export interface GenerateQuizInput {
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
}

export interface GenerateQuizResult {
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
}

export interface SummarizeNotesInput {
  title?: string;
  subject?: string;
  content: string;
}

export interface SummarizeNotesResult {
  title: string;
  subject: string;
  summary: string;
  keyPoints: string[];
  definitions: Array<{ term: string; definition: string }>;
  revisionNotes: string[];
}

export interface GenerateFlashcardsInput {
  sourceText: string;
  subject?: string;
  topic?: string;
  count?: number;
}

export interface GenerateFlashcardsResult {
  cards: Array<{
    front: string;
    back: string;
    subject: string;
    topic: string;
  }>;
}

export interface GenerateStudyPlanInput {
  examName: string;
  examDate: string;
  subjects: string[];
  knowledgeLevel: 'beginner' | 'intermediate' | 'advanced';
  dailyHours: number;
}

export interface GenerateStudyPlanResult {
  tasks: StudyPlanTask[];
}

export interface IAIProvider {
  solveQuestion(input: SolveQuestionInput): Promise<SolveQuestionResult>;
  chatTutor(input: ChatTutorInput): Promise<ChatTutorResult>;
  generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizResult>;
  summarizeNotes(input: SummarizeNotesInput): Promise<SummarizeNotesResult>;
  generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsResult>;
  generateStudyPlan(input: GenerateStudyPlanInput): Promise<GenerateStudyPlanResult>;
}
