import type {
  UserProfile,
  SolvedQuestion,
  TutorMessage,
  Quiz,
  QuizResult,
  StudyNote,
  Flashcard,
  StudyPlan,
  ProgressSummary,
  EntitlementLimits,
} from '../types/index.ts';

const API_BASE = '/api';

function getHeaders(isFormData = false): HeadersInit {
  const token = localStorage.getItem('solvo_token') || 'demo_user';
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

export const api = {
  // Auth & Profile
  async getProfile(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/profile`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load profile');
    const data = await res.json();
    return data.user;
  },

  async login(email: string): Promise<{ user: UserProfile; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  async register(params: {
    name: string;
    email: string;
    educationLevel?: string;
    preferredLanguage?: 'en' | 'ur';
    mainStudyGoal?: string;
  }): Promise<{ user: UserProfile; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  async loginAsGuest(): Promise<{ user: UserProfile; token: string }> {
    const res = await fetch(`${API_BASE}/auth/guest`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Guest login failed');
    return res.json();
  },

  async loginWithGoogle(params: {
    email: string;
    name: string;
    googleId?: string;
    picture?: string;
    credential?: string;
    educationLevel?: string;
  }): Promise<{ user: UserProfile; token: string }> {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Google authentication failed');
    return res.json();
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    const data = await res.json();
    return data.user;
  },

  // Questions & Solve
  async solveQuestion(params: {
    questionText?: string;
    imageFile?: File;
    imageBase64?: string;
  }): Promise<{ question: SolvedQuestion; provider: string }> {
    let res: Response;
    if (params.imageFile) {
      const formData = new FormData();
      if (params.questionText) formData.append('questionText', params.questionText);
      formData.append('image', params.imageFile);
      res = await fetch(`${API_BASE}/ai/solve`, {
        method: 'POST',
        headers: getHeaders(true),
        body: formData,
      });
    } else {
      res = await fetch(`${API_BASE}/ai/solve`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          questionText: params.questionText,
          imageBase64: params.imageBase64,
        }),
      });
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to solve question' }));
      throw new Error(err.error || 'Failed to solve question');
    }
    return res.json();
  },

  async getQuestions(): Promise<SolvedQuestion[]> {
    const res = await fetch(`${API_BASE}/questions`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch questions');
    const data = await res.json();
    return data.questions;
  },

  async getSavedQuestions(): Promise<SolvedQuestion[]> {
    const res = await fetch(`${API_BASE}/questions/saved`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch saved questions');
    const data = await res.json();
    return data.questions;
  },

  async toggleSaveQuestion(questionId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/questions/${questionId}/save`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to toggle bookmark');
    const data = await res.json();
    return data.isSaved;
  },

  // AI Tutor
  async getTutorMessages(): Promise<TutorMessage[]> {
    const res = await fetch(`${API_BASE}/tutor/messages`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load messages');
    const data = await res.json();
    return data.messages;
  },

  async sendTutorMessage(message: string, language?: 'en' | 'ur'): Promise<TutorMessage> {
    const res = await fetch(`${API_BASE}/tutor/message`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, language }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    const data = await res.json();
    return data.message;
  },

  async clearTutorChat(): Promise<void> {
    await fetch(`${API_BASE}/tutor/clear`, {
      method: 'POST',
      headers: getHeaders(),
    });
  },

  // Quizzes
  async generateQuiz(params: {
    subject: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    questionCount: number;
  }): Promise<Quiz> {
    const res = await fetch(`${API_BASE}/quizzes/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to generate quiz');
    const data = await res.json();
    return data.quiz;
  },

  async getQuiz(id: string): Promise<Quiz> {
    const res = await fetch(`${API_BASE}/quizzes/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Quiz not found');
    const data = await res.json();
    return data.quiz;
  },

  async submitQuiz(
    quizId: string,
    answers: Array<{ questionId: string; selectedIndex: number }>
  ): Promise<QuizResult> {
    const res = await fetch(`${API_BASE}/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ answers }),
    });
    if (!res.ok) throw new Error('Failed to submit quiz');
    const data = await res.json();
    return data.result;
  },

  async getQuizResults(): Promise<QuizResult[]> {
    const res = await fetch(`${API_BASE}/quizzes/results`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load quiz results');
    const data = await res.json();
    return data.results;
  },

  // Notes
  async summarizeNotes(params: {
    title?: string;
    subject?: string;
    content?: string;
    file?: File;
  }): Promise<StudyNote> {
    let res: Response;
    if (params.file) {
      const formData = new FormData();
      if (params.title) formData.append('title', params.title);
      if (params.subject) formData.append('subject', params.subject);
      formData.append('document', params.file);
      res = await fetch(`${API_BASE}/notes/summarize`, {
        method: 'POST',
        headers: getHeaders(true),
        body: formData,
      });
    } else {
      res = await fetch(`${API_BASE}/notes/summarize`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          title: params.title,
          subject: params.subject,
          content: params.content,
        }),
      });
    }

    if (!res.ok) throw new Error('Failed to summarize notes');
    const data = await res.json();
    return data.note;
  },

  async getNotes(): Promise<StudyNote[]> {
    const res = await fetch(`${API_BASE}/notes`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load notes');
    const data = await res.json();
    return data.notes;
  },

  async deleteNote(id: string): Promise<void> {
    await fetch(`${API_BASE}/notes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
  },

  // Flashcards
  async getFlashcards(): Promise<Flashcard[]> {
    const res = await fetch(`${API_BASE}/flashcards`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load flashcards');
    const data = await res.json();
    return data.flashcards;
  },

  async generateFlashcards(params: {
    sourceText: string;
    subject?: string;
    topic?: string;
    count?: number;
  }): Promise<Flashcard[]> {
    const res = await fetch(`${API_BASE}/flashcards/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to generate flashcards');
    const data = await res.json();
    return data.cards;
  },

  async reviewFlashcard(id: string, rating: 'easy' | 'hard' | 'again'): Promise<Flashcard> {
    const res = await fetch(`${API_BASE}/flashcards/${id}/review`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ rating }),
    });
    if (!res.ok) throw new Error('Failed to review flashcard');
    const data = await res.json();
    return data.card;
  },

  async deleteFlashcard(id: string): Promise<void> {
    await fetch(`${API_BASE}/flashcards/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
  },

  // Exam Planner
  async getStudyPlans(): Promise<StudyPlan[]> {
    const res = await fetch(`${API_BASE}/planner`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load study plans');
    const data = await res.json();
    return data.plans;
  },

  async generateStudyPlan(params: {
    examName: string;
    examDate: string;
    subjects: string[];
    knowledgeLevel: 'beginner' | 'intermediate' | 'advanced';
    dailyHours: number;
  }): Promise<StudyPlan> {
    const res = await fetch(`${API_BASE}/planner/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to generate study plan');
    const data = await res.json();
    return data.plan;
  },

  async togglePlanTask(planId: string, taskId: string, completed: boolean): Promise<StudyPlan> {
    const res = await fetch(`${API_BASE}/planner/${planId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ completed }),
    });
    if (!res.ok) throw new Error('Failed to update task');
    const data = await res.json();
    return data.plan;
  },

  // Dashboard Progress
  async getProgressSummary(): Promise<ProgressSummary> {
    const res = await fetch(`${API_BASE}/progress/summary`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load progress');
    const data = await res.json();
    return data.summary;
  },

  // Entitlements & Subscription
  async getEntitlements(): Promise<{
    plan: 'free' | 'premium';
    isPremium: boolean;
    limits: EntitlementLimits;
    usage: { questionsSolvedToday: number; scansUsedToday: number };
  }> {
    const res = await fetch(`${API_BASE}/entitlements`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load entitlements');
    return res.json();
  },

  async upgradeToPremium(): Promise<{ success: boolean; user: UserProfile }> {
    const res = await fetch(`${API_BASE}/subscription/upgrade`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Upgrade failed');
    return res.json();
  },
};
