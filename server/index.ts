import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import dotenv from 'dotenv';
import { db } from './db/database.ts';
import { aiService } from './services/ai/ai.service.ts';
import type { UserRecord, QuestionRecord } from './types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// STRICT RESOURCE STORAGE POLICY: All uploaded files and temporary data reside on E: or Google Drive Y: (Never C:). On Vercel, uses /tmp.
const isVercel = !!process.env.VERCEL;
const TEMP_DIR = isVercel ? '/tmp' : process.env.TEMP_DIR?.trim() || path.resolve(__dirname, '../tmp');
if (!isVercel && /^[c-z]:/i.test(TEMP_DIR) && TEMP_DIR.toLowerCase().startsWith('c:')) {
  throw new Error(`CRITICAL POLICY VIOLATION: Temp directory cannot be located on C: drive (${TEMP_DIR}). Solvo requires storage on E: or Google Drive Y:.`);
}
process.env.TEMP = TEMP_DIR;
process.env.TMP = TEMP_DIR;
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const rawUploadsDir = isVercel ? '/tmp' : process.env.UPLOADS_DIR?.trim() || path.resolve(__dirname, '../uploads');
if (!isVercel && /^[c-z]:/i.test(rawUploadsDir) && rawUploadsDir.toLowerCase().startsWith('c:')) {
  throw new Error(`CRITICAL POLICY VIOLATION: Uploads directory cannot be located on C: drive (${rawUploadsDir}). Solvo requires storage on E: or Google Drive Y:.`);
}
const UPLOADS_DIR = rawUploadsDir;

// Ensure uploads directory exists on E: or Y: drive
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage for uploaded questions / notes
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `upload-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'text/plain'];
    if (allowed.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Please upload an image, PDF, or text file.'));
    }
  },
});

export const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve static uploads
app.use('/uploads', express.static(UPLOADS_DIR));

// Serve production frontend bundle
const DIST_DIR = path.resolve(__dirname, '../dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    app: 'Solvo AI Study Buddy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Helper: Get user from request header
function getAuthUserId(req: Request): string {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token && token !== 'null' && token !== 'undefined') {
      return token;
    }
  }
  return '';
}

// ==========================================
// 1. AUTHENTICATION & PROFILE ROUTES
// ==========================================

app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, educationLevel, preferredLanguage, mainStudyGoal } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let existing = db.getUserByEmail(cleanEmail);
    if (existing) {
      if (name || educationLevel) {
        existing = db.updateUser(existing.id, {
          name: name?.trim() || existing.name,
          educationLevel: educationLevel || existing.educationLevel,
          preferredLanguage: preferredLanguage || existing.preferredLanguage,
          mainStudyGoal: mainStudyGoal || existing.mainStudyGoal,
        }) || existing;
      }
      return res.json({ user: existing, token: existing.id });
    }

    const normalizedId = 'user_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const newUser: UserRecord = {
      id: normalizedId,
      name: name?.trim() || cleanEmail.split('@')[0],
      email: cleanEmail,
      isGuest: false,
      educationLevel: educationLevel || 'College / A-Levels',
      preferredLanguage: preferredLanguage || 'en',
      mainStudyGoal: mainStudyGoal || 'Improve grades and understand difficult concepts',
      plan: 'free',
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      questionsSolvedCount: 0,
      scansUsedToday: 0,
      questionsSolvedToday: 0,
      createdAt: new Date().toISOString(),
    };

    db.createUser(newUser);
    return res.status(201).json({ user: newUser, token: newUser.id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = db.getUserByEmail(cleanEmail);
    if (!user) {
      // Auto-create workspace partitioned by this student's email
      const normalizedId = 'user_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
      user = {
        id: normalizedId,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        isGuest: false,
        educationLevel: 'College / A-Levels',
        preferredLanguage: 'en',
        mainStudyGoal: 'Master curriculum concepts with Solvo AI',
        plan: 'free',
        streakDays: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        questionsSolvedCount: 0,
        scansUsedToday: 0,
        questionsSolvedToday: 0,
        createdAt: new Date().toISOString(),
      };
      db.createUser(user);
    }

    return res.json({ user, token: user.id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Google OAuth & Google ID Authentication
app.post('/api/auth/google', (req: Request, res: Response) => {
  try {
    let { email, name, _googleId, picture, credential, educationLevel } = req.body;

    // Decode Google ID Token / JWT credential if provided by Google Identity Services
    if (credential && typeof credential === 'string') {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
          const payload = JSON.parse(payloadJson);
          if (payload.email) email = payload.email;
          if (payload.name) name = payload.name;
          if (payload.sub) _googleId = payload.sub;
          if (payload.picture) picture = payload.picture;
        }
      } catch (tokenErr) {
        console.warn('Could not parse Google credential JWT:', tokenErr);
      }
    }

    if (!email) {
      return res.status(400).json({ error: 'Google email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = db.getUserByEmail(cleanEmail);

    if (user) {
      // Update existing user with Google details
      const updates: Partial<UserRecord> = {
        authProvider: 'google',
      };
      if (picture && !user.avatarUrl) updates.avatarUrl = picture;
      if (name && (!user.name || user.name.startsWith('user_'))) updates.name = name;

      user = db.updateUser(user.id, updates) || user;
    } else {
      // Register new user via Google with persistent email-based ID
      const newId = 'user_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
      user = {
        id: newId,
        name: name?.trim() || cleanEmail.split('@')[0],
        email: cleanEmail,
        isGuest: false,
        educationLevel: educationLevel || 'College / A-Levels',
        preferredLanguage: 'en',
        mainStudyGoal: 'Master curriculum concepts with Solvo AI',
        plan: 'free',
        streakDays: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        questionsSolvedCount: 0,
        scansUsedToday: 0,
        questionsSolvedToday: 0,
        avatarUrl: picture,
        authProvider: 'google',
        createdAt: new Date().toISOString(),
      };
      db.createUser(user);
    }

    return res.json({ user, token: user.id });
  } catch (err: any) {
    console.error('Google Auth Error:', err);
    return res.status(500).json({ error: err.message || 'Google authentication failed' });
  }
});

app.post('/api/auth/guest', (_req: Request, res: Response) => {
  try {
    const guestId = `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const guestUser: UserRecord = {
      id: guestId,
      name: 'Guest Scholar',
      email: `${guestId}@solvo.study`,
      isGuest: true,
      educationLevel: 'High School',
      preferredLanguage: 'en',
      mainStudyGoal: 'Explore Solvo study assistant',
      plan: 'free',
      streakDays: 3,
      lastActiveDate: new Date().toISOString().split('T')[0],
      questionsSolvedCount: 6,
      scansUsedToday: 1,
      questionsSolvedToday: 2,
      createdAt: new Date().toISOString(),
    };
    db.createUser(guestUser);
    return res.json({ user: guestUser, token: guestUser.id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/profile', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in with your Gmail.' });
  }
  const user = db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({ user });
});

app.patch('/api/auth/profile', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const updates = req.body;
  const updated = db.updateUser(userId, updates);
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({ user: updated });
});

// ==========================================
// 2. AI QUESTION SOLVER & SCAN ROUTES
// ==========================================

app.post('/api/ai/solve', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const user = db.getUserById(userId);

    // Entitlement Check for Free plan
    if (user && user.plan === 'free') {
      if (req.file && user.scansUsedToday >= 10) {
        return res.status(429).json({
          error: 'Daily scan limit reached for Free plan (10 scans/day). Upgrade to Premium for unlimited scans!',
          isLimitReached: true,
        });
      }
    }

    let questionText = (req.body.questionText || '').trim();
    let imageBase64: string | undefined = undefined;
    let mimeType = 'image/jpeg';
    let imageUrl: string | undefined = undefined;

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      const filePath = req.file.path;
      const fileBuffer = fs.readFileSync(filePath);
      imageBase64 = fileBuffer.toString('base64');
      mimeType = req.file.mimetype;

      // Increment scan counter
      if (user) {
        user.scansUsedToday = (user.scansUsedToday || 0) + 1;
        db.updateUser(user.id, { scansUsedToday: user.scansUsedToday });
      }
    } else if (req.body.imageBase64) {
      imageBase64 = req.body.imageBase64;
      mimeType = req.body.mimeType || 'image/jpeg';
    }

    if (!questionText && !imageBase64) {
      return res.status(400).json({ error: 'Please enter a question or provide an image to solve.' });
    }

    const provider = aiService.getProvider();
    const solution = await provider.solveQuestion({
      questionText,
      imageBase64,
      mimeType,
      preferredLanguage: user?.preferredLanguage || 'en',
    });

    const newQuestionRecord: QuestionRecord = {
      id: `q_${Date.now()}`,
      userId,
      subject: solution.subject,
      topic: solution.topic,
      questionText: solution.questionText || questionText,
      imageUrl,
      steps: solution.steps,
      finalAnswer: solution.finalAnswer,
      explanation: solution.explanation,
      urduExplanation: solution.urduExplanation,
      simplerExplanation: solution.simplerExplanation,
      alternativeMethod: solution.alternativeMethod,
      similarPracticeQuestion: solution.similarPracticeQuestion,
      createdAt: new Date().toISOString(),
    };

    db.saveQuestion(newQuestionRecord);

    return res.json({
      question: {
        ...newQuestionRecord,
        isSaved: db.isQuestionSaved(userId, newQuestionRecord.id),
      },
      provider: aiService.getProviderName(),
    });
  } catch (err: any) {
    console.error('Error in /api/ai/solve:', err);
    return res.status(500).json({ error: err.message || 'Failed to solve question. Please try again.' });
  }
});

app.get('/api/questions', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const questions = db.getQuestionsByUserId(userId);
  const mapped = questions.map((q) => ({
    ...q,
    isSaved: db.isQuestionSaved(userId, q.id),
  }));
  return res.json({ questions: mapped });
});

app.get('/api/questions/saved', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const saved = db.getSavedQuestions(userId);
  const mapped = saved.map((q) => ({ ...q, isSaved: true }));
  return res.json({ questions: mapped });
});

app.post('/api/questions/:id/save', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const questionId = req.params.id as string;
  const isSaved = db.toggleSaveQuestion(userId, questionId);
  return res.json({ isSaved, questionId });
});

// ==========================================
// 3. AI TUTOR CONVERSATION ROUTES
// ==========================================

app.get('/api/tutor/messages', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const messages = db.getTutorMessages(userId);
  return res.json({ messages });
});

app.post('/api/tutor/message', async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const { message, language } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const user = db.getUserById(userId);
    const lang = language || user?.preferredLanguage || 'en';

    // 1. Save user message
    const userMsgRecord = {
      id: `tm_u_${Date.now()}`,
      userId,
      conversationId: 'default',
      sender: 'user' as const,
      text: message.trim(),
      language: lang,
      timestamp: new Date().toISOString(),
    };
    db.saveTutorMessage(userMsgRecord);

    // 2. Fetch recent conversation context (last 6 messages)
    const historyRecords = db.getTutorMessages(userId).slice(-6);
    const history = historyRecords.map((m) => ({ sender: m.sender, text: m.text }));

    // 3. Call AI provider
    const provider = aiService.getProvider();
    const reply = await provider.chatTutor({
      message: message.trim(),
      history,
      language: lang,
    });

    // 4. Save Solvo message
    const solvoMsgRecord = {
      id: `tm_s_${Date.now()}`,
      userId,
      conversationId: 'default',
      sender: 'solvo' as const,
      text: reply.text,
      language: reply.language,
      quickActions: reply.quickActions,
      timestamp: new Date().toISOString(),
    };
    db.saveTutorMessage(solvoMsgRecord);

    return res.json({ message: solvoMsgRecord });
  } catch (err: any) {
    console.error('Error in /api/tutor/message:', err);
    return res.status(500).json({ error: err.message || 'Tutor response failed.' });
  }
});

app.post('/api/tutor/clear', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  db.clearTutorMessages(userId);
  return res.json({ success: true });
});

// ==========================================
// 4. QUIZ GENERATOR & ENGINE ROUTES
// ==========================================

app.post('/api/quizzes/generate', async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const { subject, topic, difficulty, questionCount } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({ error: 'Subject and topic are required to generate a quiz.' });
    }

    const count = Math.min(Math.max(Number(questionCount) || 5, 3), 10);
    const diff = (difficulty || 'medium').toLowerCase() as 'easy' | 'medium' | 'hard';

    const provider = aiService.getProvider();
    const generated = await provider.generateQuiz({
      subject,
      topic,
      difficulty: diff,
      questionCount: count,
    });

    const quizRecord = {
      id: `quiz_${Date.now()}`,
      userId,
      subject: generated.subject,
      topic: generated.topic,
      difficulty: generated.difficulty,
      questions: generated.questions,
      createdAt: new Date().toISOString(),
    };

    db.saveQuiz(quizRecord);

    return res.json({ quiz: quizRecord });
  } catch (err: any) {
    console.error('Error in /api/quizzes/generate:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate quiz.' });
  }
});

app.get('/api/quizzes/:id', (req: Request, res: Response) => {
  const quiz = db.getQuizById(req.params.id as string);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  return res.json({ quiz });
});

app.post('/api/quizzes/:id/submit', (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const quizId = req.params.id as string;
    const { answers } = req.body; // Array of { questionId, selectedIndex }

    const quiz = db.getQuizById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    let score = 0;
    const weakTopics: string[] = [];
    const evaluatedAnswers = quiz.questions.map((q) => {
      const userSubmission = answers?.find((a: any) => a.questionId === q.id);
      const selectedIndex = userSubmission !== undefined ? userSubmission.selectedIndex : -1;
      const isCorrect = selectedIndex === q.correctIndex;

      if (isCorrect) {
        score++;
      } else {
        weakTopics.push(`${quiz.topic} - Question ${q.id.replace('q_', '')}`);
      }

      return {
        questionId: q.id,
        question: q.question,
        selectedIndex,
        correctIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    let recommendation = '';
    if (percentage >= 80) {
      recommendation = `Outstanding mastery! You scored ${percentage}%. Advance to harder topics or try an advanced challenge.`;
    } else if (percentage >= 60) {
      recommendation = `Good solid progress (${percentage}%). Review the questions you missed, especially on key formulas, then re-test.`;
    } else {
      recommendation = `You scored ${percentage}%. We recommend reviewing the foundational concepts for ${quiz.topic} in Solvo AI Tutor, then taking a 3-question practice quiz.`;
    }

    const resultRecord = {
      id: `qr_${Date.now()}`,
      quizId,
      userId,
      subject: quiz.subject,
      topic: quiz.topic,
      score,
      totalQuestions,
      percentage,
      answers: evaluatedAnswers,
      weakTopics: weakTopics.slice(0, 3),
      recommendation,
      completedAt: new Date().toISOString(),
    };

    db.saveQuizResult(resultRecord);

    return res.json({ result: resultRecord });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/quizzes/results', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const results = db.getQuizResults(userId);
  return res.json({ results });
});

// ==========================================
// 5. NOTES & DOCUMENT SUMMARIES
// ==========================================

app.post('/api/notes/summarize', upload.single('document'), async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    let title = req.body.title || 'Study Material Notes';
    let subject = req.body.subject || 'General Academic';
    let content = (req.body.content || '').trim();

    if (req.file) {
      title = req.body.title || req.file.originalname;
      // Read text if plain text, or placeholder analysis for binary files
      if (req.file.mimetype === 'text/plain') {
        content = fs.readFileSync(req.file.path, 'utf-8');
      } else {
        content = `Uploaded file: ${req.file.originalname} (${req.file.mimetype}). Document contains academic syllabus topics, formulas, definitions, and chapter summaries.`;
      }
    }

    if (!content) {
      return res.status(400).json({ error: 'Please provide notes content or upload a study file.' });
    }

    const provider = aiService.getProvider();
    const summaryResult = await provider.summarizeNotes({
      title,
      subject,
      content,
    });

    const noteRecord = {
      id: `note_${Date.now()}`,
      userId,
      title: summaryResult.title,
      subject: summaryResult.subject || subject,
      originalText: content.slice(0, 1000),
      summary: summaryResult.summary,
      keyPoints: summaryResult.keyPoints,
      definitions: summaryResult.definitions,
      revisionNotes: summaryResult.revisionNotes,
      createdAt: new Date().toISOString(),
    };

    db.saveNote(noteRecord);

    return res.json({ note: noteRecord });
  } catch (err: any) {
    console.error('Error in /api/notes/summarize:', err);
    return res.status(500).json({ error: err.message || 'Failed to summarize notes.' });
  }
});

app.get('/api/notes', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const notes = db.getNotesByUserId(userId);
  return res.json({ notes });
});

app.delete('/api/notes/:id', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const deleted = db.deleteNote(req.params.id as string, userId);
  return res.json({ success: deleted });
});

// ==========================================
// 6. FLASHCARDS ROUTES
// ==========================================

app.get('/api/flashcards', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const flashcards = db.getFlashcardsByUserId(userId);
  return res.json({ flashcards });
});

app.post('/api/flashcards/generate', async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const { sourceText, subject, topic, count } = req.body;

    const provider = aiService.getProvider();
    const result = await provider.generateFlashcards({
      sourceText: sourceText || `${subject || 'Academic'} ${topic || 'Key Concepts'}`,
      subject: subject || 'General',
      topic: topic || 'Key Concepts',
      count: Number(count) || 4,
    });

    const createdCards = result.cards.map((c, i) => {
      const cardRecord = {
        id: `fc_${Date.now()}_${i}`,
        userId,
        subject: c.subject,
        topic: c.topic,
        front: c.front,
        back: c.back,
        difficultyRating: 'easy' as const,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
      };
      db.saveFlashcard(cardRecord);
      return cardRecord;
    });

    return res.json({ cards: createdCards });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate flashcards.' });
  }
});

app.patch('/api/flashcards/:id/review', (req: Request, res: Response) => {
  const cardId = req.params.id as string;
  const { rating } = req.body; // 'easy' | 'hard' | 'again'

  const current = db.getFlashcardsByUserId(getAuthUserId(req)).find((f) => f.id === cardId);
  const updated = db.updateFlashcard(cardId, {
    difficultyRating: rating,
    reviewCount: (current?.reviewCount || 0) + 1,
    lastReviewed: new Date().toISOString(),
  });

  return res.json({ card: updated });
});

app.delete('/api/flashcards/:id', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const deleted = db.deleteFlashcard(req.params.id as string, userId);
  return res.json({ success: deleted });
});

// ==========================================
// 7. EXAM PLANNER ROUTES
// ==========================================

app.get('/api/planner', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const plans = db.getStudyPlansByUserId(userId);
  return res.json({ plans });
});

app.post('/api/planner/generate', async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const { examName, examDate, subjects, knowledgeLevel, dailyHours } = req.body;

    if (!examName || !examDate || !subjects?.length) {
      return res.status(400).json({ error: 'Exam name, exam date, and at least one subject are required.' });
    }

    const now = new Date();
    const target = new Date(examDate);
    const daysRemaining = Math.max(1, Math.round((target.getTime() - now.getTime()) / 86400000));

    const provider = aiService.getProvider();
    const planResult = await provider.generateStudyPlan({
      examName,
      examDate,
      subjects,
      knowledgeLevel: knowledgeLevel || 'intermediate',
      dailyHours: Number(dailyHours) || 2,
    });

    const planRecord = {
      id: `plan_${Date.now()}`,
      userId,
      examName,
      examDate,
      daysRemaining,
      subjects,
      knowledgeLevel: knowledgeLevel || 'intermediate',
      dailyHours: Number(dailyHours) || 2,
      tasks: planResult.tasks,
      completionPercentage: 0,
      createdAt: new Date().toISOString(),
    };

    db.saveStudyPlan(planRecord);

    return res.json({ plan: planRecord });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate study plan.' });
  }
});

app.patch('/api/planner/:planId/tasks/:taskId', (req: Request, res: Response) => {
  const planId = req.params.planId as string;
  const taskId = req.params.taskId as string;
  const { completed } = req.body;
  const updated = db.updateStudyPlanTask(planId, taskId, Boolean(completed));
  if (!updated) {
    return res.status(404).json({ error: 'Plan or task not found.' });
  }
  return res.json({ plan: updated });
});

// ==========================================
// 8. PROGRESS & RECOMMENDATIONS DASHBOARD
// ==========================================

app.get('/api/progress/summary', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const summary = db.getProgressSummary(userId);
  return res.json({ success: true, summary });
});

// ==========================================
// 9. ENTITLEMENTS & MONETIZATION
// ==========================================

app.get('/api/entitlements', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const user = db.getUserById(userId);
  const isPremium = user?.plan === 'premium';

  return res.json({
    plan: user?.plan || 'free',
    isPremium,
    limits: {
      dailyQuestionsLimit: isPremium ? 9999 : 25,
      dailyScansLimit: isPremium ? 9999 : 10,
      maxQuizQuestions: isPremium ? 20 : 5,
      allowAdvancedPdf: isPremium,
      allowCustomExamPlanner: isPremium,
      allowUnlimitedHistory: isPremium,
    },
    usage: {
      questionsSolvedToday: user?.questionsSolvedToday || 0,
      scansUsedToday: user?.scansUsedToday || 0,
    },
  });
});

app.post('/api/subscription/upgrade', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const updated = db.updateUser(userId, { plan: 'premium' });
  return res.json({ success: true, user: updated });
});

// SPA Client-side Route Fallback (Express 5 compatible)
if (fs.existsSync(DIST_DIR)) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(DIST_DIR, 'index.html'));
    }
    next();
  });
}


// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server Unhandled Error:', err);
  return res.status(500).json({ error: err.message || 'Internal server error' });
});

if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`===========================================`);
    console.log(`  SOLVO Server running on port ${PORT}`);
    console.log(`  Uploads stored on: ${UPLOADS_DIR}`);
    console.log(`  Database stored on: ${process.env.DATA_DIR || 'E:\\study assistant\\data'}`);
    console.log(`  Storage Policy: ZERO C: drive writes enforced (E: / Y: only)`);
    console.log(`  AI Provider: ${aiService.getProviderName()}`);
    console.log(`===========================================`);
  });
}

export default app;
