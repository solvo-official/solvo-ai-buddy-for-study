export type EducationLevel = 'Middle School' | 'High School' | 'College / A-Levels' | 'University' | 'Competitive Exams';
export type Language = 'en' | 'ur';
export type PlanTier = 'free' | 'premium';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  educationLevel: EducationLevel;
  preferredLanguage: Language;
  mainStudyGoal: string;
  plan: PlanTier;
  streakDays: number;
  lastActiveDate: string;
  questionsSolvedCount: number;
  scansUsedToday: number;
  questionsSolvedToday: number;
  avatarUrl?: string;
  authProvider?: 'email' | 'google' | 'guest';
  token?: string;
}

export interface SolutionStep {
  stepNumber: number;
  title: string;
  content: string;
  keyRuleOrFormula?: string;
}

export interface AlternativeMethod {
  title: string;
  steps: string[];
  finalAnswer: string;
}

export interface SolvedQuestion {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  questionText: string;
  imageUrl?: string;
  steps: SolutionStep[];
  finalAnswer: string;
  explanation: string;
  urduExplanation?: string;
  simplerExplanation?: string;
  alternativeMethod?: AlternativeMethod;
  similarPracticeQuestion?: {
    question: string;
    hint: string;
    answer: string;
    explanation: string;
  };
  isSaved?: boolean;
  createdAt: string;
}

export interface TutorMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'solvo';
  text: string;
  language: Language;
  quickActions?: string[];
  timestamp: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  userId: string;
  subject: string;
  topic: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: Array<{
    questionId: string;
    question: string;
    selectedIndex: number;
    correctIndex: number;
    isCorrect: boolean;
    explanation: string;
  }>;
  weakTopics: string[];
  recommendation: string;
  completedAt: string;
}

export interface Flashcard {
  id: string;
  userId: string;
  deckId?: string;
  subject: string;
  topic: string;
  front: string;
  back: string;
  difficultyRating?: 'easy' | 'hard' | 'again';
  reviewCount: number;
  lastReviewed?: string;
}

export interface StudyNote {
  id: string;
  userId: string;
  title: string;
  subject: string;
  originalText?: string;
  summary: string;
  keyPoints: string[];
  definitions: Array<{ term: string; definition: string }>;
  revisionNotes: string[];
  createdAt: string;
}

export interface StudyPlanTask {
  id: string;
  date: string;
  dayLabel: string;
  subject: string;
  task: string;
  type: 'concept' | 'revision' | 'quiz' | 'practice';
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  userId: string;
  examName: string;
  examDate: string;
  daysRemaining: number;
  subjects: string[];
  knowledgeLevel: 'beginner' | 'intermediate' | 'advanced';
  dailyHours: number;
  tasks: StudyPlanTask[];
  completionPercentage: number;
  createdAt: string;
}

export interface ProgressSummary {
  questionsSolved: number;
  quizzesCompleted: number;
  averageQuizScore: number;
  studyStreak: number;
  studyTimeMinutes: number;
  subjectsStudied: Array<{
    subject: string;
    count: number;
    accuracy: number;
  }>;
  strongTopics: string[];
  weakTopics: string[];
  recentActivity: Array<{
    id: string;
    type: 'question' | 'quiz' | 'note' | 'flashcard';
    title: string;
    subtitle: string;
    timestamp: string;
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    actionType: 'quiz' | 'practice' | 'review';
    subject: string;
    topic: string;
  }>;
}

export interface EntitlementLimits {
  dailyQuestionsLimit: number;
  dailyScansLimit: number;
  maxQuizQuestions: number;
  allowAdvancedPdf: boolean;
  allowCustomExamPlanner: boolean;
  allowUnlimitedHistory: boolean;
}
