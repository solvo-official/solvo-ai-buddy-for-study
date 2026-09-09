export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  isGuest: boolean;
  educationLevel: string;
  preferredLanguage: 'en' | 'ur';
  mainStudyGoal: string;
  plan: 'free' | 'premium';
  streakDays: number;
  lastActiveDate: string;
  questionsSolvedCount: number;
  scansUsedToday: number;
  questionsSolvedToday: number;
  avatarUrl?: string;
  authProvider?: 'email' | 'google' | 'guest';
  createdAt: string;
}

export interface QuestionRecord {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  questionText: string;
  imageUrl?: string;
  steps: Array<{
    stepNumber: number;
    title: string;
    content: string;
    keyRuleOrFormula?: string;
  }>;
  finalAnswer: string;
  explanation: string;
  urduExplanation?: string;
  simplerExplanation?: string;
  alternativeMethod?: {
    title: string;
    steps: string[];
    finalAnswer: string;
  };
  similarPracticeQuestion?: {
    question: string;
    hint: string;
    answer: string;
    explanation: string;
  };
  createdAt: string;
}

export interface SavedQuestionRecord {
  id: string;
  userId: string;
  questionId: string;
  savedAt: string;
}

export interface TutorMessageRecord {
  id: string;
  userId: string;
  conversationId: string;
  sender: 'user' | 'solvo';
  text: string;
  language: 'en' | 'ur';
  quickActions?: string[];
  timestamp: string;
}

export interface QuizRecord {
  id: string;
  userId?: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: Array<{
    id: string;
    question: string;
    options: [string, string, string, string];
    correctIndex: number;
    explanation: string;
  }>;
  createdAt: string;
}

export interface QuizResultRecord {
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

export interface NoteRecord {
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

export interface FlashcardRecord {
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
  createdAt: string;
}

export interface StudyPlanRecord {
  id: string;
  userId: string;
  examName: string;
  examDate: string;
  daysRemaining: number;
  subjects: string[];
  knowledgeLevel: 'beginner' | 'intermediate' | 'advanced';
  dailyHours: number;
  tasks: Array<{
    id: string;
    date: string;
    dayLabel: string;
    subject: string;
    task: string;
    type: 'concept' | 'revision' | 'quiz' | 'practice';
    completed: boolean;
  }>;
  completionPercentage: number;
  createdAt: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  questions: QuestionRecord[];
  savedQuestions: SavedQuestionRecord[];
  tutorMessages: TutorMessageRecord[];
  quizzes: QuizRecord[];
  quizResults: QuizResultRecord[];
  notes: NoteRecord[];
  flashcards: FlashcardRecord[];
  studyPlans: StudyPlanRecord[];
}
