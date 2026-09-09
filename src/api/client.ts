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
  const token = localStorage.getItem('questrix_token') || localStorage.getItem('solvo_token');
  const headers: Record<string, string> = {};
  if (token && token !== 'null' && token !== 'undefined') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

export const api = {
  // Auth & Profile
  async getProfile(): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.user;
      }
    } catch (err) {
      console.warn('[Questrix API] Could not fetch remote profile:', err);
    }

    // Return cached user from local storage
    const cached = localStorage.getItem('questrix_user') || localStorage.getItem('solvo_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    throw new Error('No profile available');
  },

  async login(email: string): Promise<{ user: UserProfile; token: string }> {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email: cleanEmail }),
      });
      if (res.ok) {
        return await res.json();
      }
      console.warn(`[Questrix API] Remote login returned ${res.status}, activating local partition.`);
    } catch (err) {
      console.warn('[Questrix API] Network error during login, activating local partition:', err);
    }

    // Fallback: Deterministic student profile partitioned by Gmail
    const userId = 'user_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const localKey = `questrix_profile_${userId}`;
    const legacyKey = `solvo_profile_${userId}`;
    let existing: UserProfile | null = null;
    try {
      const raw = localStorage.getItem(localKey) || localStorage.getItem(legacyKey);
      if (raw) existing = JSON.parse(raw);
    } catch {}

    const user: UserProfile = existing || {
      id: userId,
      name: cleanEmail.split('@')[0].charAt(0).toUpperCase() + cleanEmail.split('@')[0].slice(1),
      email: cleanEmail,
      authProvider: 'email',
      educationLevel: 'College / A-Levels',
      preferredLanguage: 'en',
      mainStudyGoal: 'Ace upcoming board exams & master STEM concepts',
      plan: 'free',
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      questionsSolvedCount: 0,
      scansUsedToday: 0,
      questionsSolvedToday: 0,
    };

    localStorage.setItem(localKey, JSON.stringify(user));
    return { user, token: `token_${userId}` };
  },

  async register(params: {
    name: string;
    email: string;
    educationLevel?: string;
    preferredLanguage?: 'en' | 'ur';
    mainStudyGoal?: string;
  }): Promise<{ user: UserProfile; token: string }> {
    const cleanEmail = params.email.trim().toLowerCase();
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ...params, email: cleanEmail }),
      });
      if (res.ok) {
        return await res.json();
      }
      console.warn(`[Questrix API] Remote register returned ${res.status}, activating local partition.`);
    } catch (err) {
      console.warn('[Questrix API] Network error during register, activating local partition:', err);
    }

    const userId = 'user_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const user: UserProfile = {
      id: userId,
      name: params.name.trim() || (cleanEmail.split('@')[0].charAt(0).toUpperCase() + cleanEmail.split('@')[0].slice(1)),
      email: cleanEmail,
      authProvider: 'email',
      educationLevel: (params.educationLevel as any) || 'College / A-Levels',
      preferredLanguage: params.preferredLanguage || 'en',
      mainStudyGoal: params.mainStudyGoal || 'Ace upcoming board exams & master STEM concepts',
      plan: 'free',
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      questionsSolvedCount: 0,
      scansUsedToday: 0,
      questionsSolvedToday: 0,
    };

    localStorage.setItem(`questrix_profile_${userId}`, JSON.stringify(user));
    return { user, token: `token_${userId}` };
  },

  async loginAsGuest(): Promise<{ user: UserProfile; token: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/guest`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (res.ok) return await res.json();
    } catch {}

    const guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
    const guestUser: UserProfile = {
      id: guestId,
      name: 'Guest Scholar',
      email: `${guestId}@questrix.local`,
      authProvider: 'guest',
      educationLevel: 'High School',
      preferredLanguage: 'en',
      mainStudyGoal: 'Exploring Questrix Study Buddy',
      plan: 'free',
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      questionsSolvedCount: 0,
      scansUsedToday: 0,
      questionsSolvedToday: 0,
    };
    return { user: guestUser, token: `token_${guestId}` };
  },

  async loginWithGoogle(params: {
    email: string;
    name: string;
    googleId?: string;
    picture?: string;
    credential?: string;
    educationLevel?: string;
  }): Promise<{ user: UserProfile; token: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(params),
      });
      if (res.ok) {
        return await res.json();
      }
      console.warn(`[Questrix API] Remote Google auth returned ${res.status}, activating local partition.`);
    } catch (err) {
      console.warn('[Questrix API] Network error during Google auth, activating local partition:', err);
    }

    let userEmail = params.email;
    let userName = params.name;
    let userPicture = params.picture;

    if (params.credential) {
      try {
        const payloadBase64 = params.credential.split('.')[1];
        if (payloadBase64) {
          const payload = JSON.parse(atob(payloadBase64));
          if (payload.email) userEmail = payload.email;
          if (payload.name) userName = payload.name;
          if (payload.picture) userPicture = payload.picture;
        }
      } catch {}
    }

    const cleanEmail = (userEmail || 'google_student@gmail.com').trim().toLowerCase();
    const userId = 'user_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const user: UserProfile = {
      id: userId,
      name: userName || (cleanEmail.split('@')[0].charAt(0).toUpperCase() + cleanEmail.split('@')[0].slice(1)),
      email: cleanEmail,
      avatarUrl: userPicture,
      authProvider: 'google',
      educationLevel: (params.educationLevel as any) || 'College / A-Levels',
      preferredLanguage: 'en',
      mainStudyGoal: 'Ace upcoming board exams & master STEM concepts',
      plan: 'free',
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      questionsSolvedCount: 0,
      scansUsedToday: 0,
      questionsSolvedToday: 0,
    };

    localStorage.setItem(`questrix_profile_${userId}`, JSON.stringify(user));
    return { user, token: `token_${userId}` };
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        return data.user;
      }
    } catch (err) {
      console.warn('[Questrix API] Failed to update remote profile, saving locally:', err);
    }

    const cached = localStorage.getItem('questrix_user') || localStorage.getItem('solvo_user');
    const existing = cached ? JSON.parse(cached) : {};
    const updated = { ...existing, ...updates };
    localStorage.setItem('questrix_user', JSON.stringify(updated));
    if (updated.id) {
      localStorage.setItem(`questrix_profile_${updated.id}`, JSON.stringify(updated));
    }
    return updated;
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
