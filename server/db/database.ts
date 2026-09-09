import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  DatabaseSchema,
  UserRecord,
  QuestionRecord,
  TutorMessageRecord,
  QuizRecord,
  QuizResultRecord,
  NoteRecord,
  FlashcardRecord,
  StudyPlanRecord,
  ProgressSummaryRecord,
} from '../types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// STRICT RESOURCE STORAGE POLICY: All database files reside on E: or Google Drive Y: (Never C:). On Vercel serverless, uses /tmp.
const isVercel = !!process.env.VERCEL;
const rawDataDir = isVercel
  ? '/tmp'
  : process.env.DATA_DIR?.trim() || path.resolve(__dirname, '../../data');

if (!isVercel && /^[c-z]:/i.test(rawDataDir) && rawDataDir.toLowerCase().startsWith('c:')) {
  throw new Error(`CRITICAL POLICY VIOLATION: Database directory cannot be located on C: drive (${rawDataDir}). Solvo requires storage on E: or Google Drive Y:.`);
}
const DATA_DIR = rawDataDir;
const DB_FILE = path.join(DATA_DIR, 'solvo_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Seed Data
const defaultSeedData: DatabaseSchema = {
  users: [
    {
      id: 'demo_user',
      name: 'Sultan',
      email: 'student@solvo.study',
      isGuest: false,
      educationLevel: 'College / A-Levels',
      preferredLanguage: 'en',
      mainStudyGoal: 'Ace upcoming board exams & master STEM concepts',
      plan: 'free',
      streakDays: 5,
      lastActiveDate: new Date().toISOString().split('T')[0],
      questionsSolvedCount: 24,
      scansUsedToday: 1,
      questionsSolvedToday: 3,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ],
  questions: [
    {
      id: 'q_demo_1',
      userId: 'demo_user',
      subject: 'Mathematics',
      topic: 'Quadratic Equations',
      questionText: 'Solve for x: 2x² - 7x + 3 = 0',
      steps: [
        {
          stepNumber: 1,
          title: 'Identify coefficients of the quadratic equation',
          content: 'The standard form is ax² + bx + c = 0. Here, a = 2, b = -7, and c = 3.',
          keyRuleOrFormula: 'ax² + bx + c = 0',
        },
        {
          stepNumber: 2,
          title: 'Factor by grouping (Splitting the middle term)',
          content: 'We need two numbers that multiply to a · c = (2)(3) = 6 and add up to b = -7. These numbers are -6 and -1.',
        },
        {
          stepNumber: 3,
          title: 'Rewrite the expression and group terms',
          content: '2x² - 6x - 1x + 3 = 0\n2x(x - 3) - 1(x - 3) = 0\n(2x - 1)(x - 3) = 0',
          keyRuleOrFormula: '(ax + p)(bx + q) = 0',
        },
        {
          stepNumber: 4,
          title: 'Apply the Zero-Product Property',
          content: 'Either (2x - 1) = 0  =>  2x = 1  =>  x = 1/2\nOr (x - 3) = 0  =>  x = 3',
        },
      ],
      finalAnswer: 'x = 3  or  x = 1/2 (0.5)',
      explanation: 'Quadratic equations can be solved using factoring, completing the square, or the quadratic formula. Factoring here is the most straightforward method because 6 factors nicely into (-6) and (-1).',
      urduExplanation: 'یہ مساوات ax² + bx + c = 0 کی شکل میں ہے۔ درمیان والی رقم (-7x) کو دو حصوں (-6x اور -1x) میں تقسیم کر کے ہم مشترک جوڑے بنا کر تجزی (Factoring) کرتے ہیں۔ جس سے x کی قیمتیں 3 اور 1/2 حاصل ہوتی ہیں۔',
      simplerExplanation: 'Break the middle term -7x into -6x and -1x. Then take common terms out: 2x(x - 3) - 1(x - 3) = 0. Set each bracket to 0 to get x = 3 and x = 0.5.',
      alternativeMethod: {
        title: 'Using the Quadratic Formula',
        steps: [
          'Use formula: x = [-b ± √(b² - 4ac)] / (2a)',
          'Substitute: x = [7 ± √((-7)² - 4(2)(3))] / (2 · 2)',
          'Discriminant: √[49 - 24] = √25 = 5',
          'Calculate: x = (7 + 5)/4 = 3, or x = (7 - 5)/4 = 2/4 = 0.5',
        ],
        finalAnswer: 'x = 3 or x = 0.5',
      },
      similarPracticeQuestion: {
        question: 'Solve for x: 3x² - 10x + 3 = 0',
        hint: 'Find two numbers that multiply to 9 and add to -10 (-9 and -1).',
        answer: 'x = 3 or x = 1/3',
        explanation: '3x² - 9x - 1x + 3 = 0 => 3x(x - 3) - 1(x - 3) = 0 => (3x - 1)(x - 3) = 0 => x = 3 or x = 1/3.',
      },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'q_demo_2',
      userId: 'demo_user',
      subject: 'Physics',
      topic: "Newton's Second Law",
      questionText: 'A 1200 kg car accelerates uniformly from rest to 24 m/s in 8 seconds. Calculate the net force exerted on the car.',
      steps: [
        {
          stepNumber: 1,
          title: 'Extract given values',
          content: 'Mass (m) = 1200 kg\nInitial velocity (u) = 0 m/s\nFinal velocity (v) = 24 m/s\nTime (t) = 8 s',
        },
        {
          stepNumber: 2,
          title: 'Calculate acceleration using the first equation of motion',
          content: 'a = (v - u) / t = (24 - 0) / 8 = 3.0 m/s²',
          keyRuleOrFormula: 'v = u + at',
        },
        {
          stepNumber: 3,
          title: "Apply Newton's 2nd Law of Motion",
          content: 'F = m · a\nF = 1200 kg × 3.0 m/s² = 3600 N',
          keyRuleOrFormula: 'F_net = m · a',
        },
      ],
      finalAnswer: 'Net Force = 3600 N (Newtons)',
      explanation: 'Net force is directly proportional to both mass and acceleration. By finding acceleration first from kinematics, we multiply it by the mass of the car to obtain the required propelling force.',
      urduExplanation: 'کار کا اسراع (Acceleration) پہلی مساوات حرکت a = (v - u)/t سے معلوم کیا گیا جو کہ 3 میٹر فی سیکنڈ اسکوائر آیا۔ پھر نیوٹن کے دوسرے قانون F = m · a کے مطابق نیٹ فورس 3600 نیوٹن حاصل ہوئی۔',
      simplerExplanation: 'First find how fast the car speeds up every second: 24 / 8 = 3 m/s². Then multiply by the mass: 1200 × 3 = 3600 Newtons.',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ],
  savedQuestions: [
    {
      id: 'sq_1',
      userId: 'demo_user',
      questionId: 'q_demo_1',
      savedAt: new Date().toISOString(),
    },
  ],
  tutorMessages: [
    {
      id: 'tm_1',
      userId: 'demo_user',
      conversationId: 'default',
      sender: 'solvo',
      text: "Assalam-o-Alaikum and Hello Sultan! I'm Solvo, your AI Study Buddy. How can I help you today? You can ask any question, paste a problem, or tap a quick action below!",
      language: 'en',
      quickActions: ['Explain simpler', 'Give an example', 'Quiz me', 'Explain in Urdu', 'Practice this'],
      timestamp: new Date(Date.now() - 1000000).toISOString(),
    },
  ],
  quizzes: [
    {
      id: 'quiz_demo_1',
      subject: 'Mathematics',
      topic: 'Quadratic Equations',
      difficulty: 'medium',
      questions: [
        {
          id: 'qq_1',
          question: 'What is the discriminant of the quadratic equation 2x² - 4x + 2 = 0?',
          options: ['0', '4', '16', '-8'],
          correctIndex: 0,
          explanation: 'The discriminant formula is b² - 4ac. Here, b = -4, a = 2, c = 2. So (-4)² - 4(2)(2) = 16 - 16 = 0.',
        },
        {
          id: 'qq_2',
          question: 'If the discriminant of a quadratic equation is negative, what nature of roots does it have?',
          options: ['Real and distinct', 'Real and equal', 'Complex / Imaginary', 'Rational and integer'],
          correctIndex: 2,
          explanation: 'When b² - 4ac < 0, taking the square root yields an imaginary number, so the roots are complex conjugate pairs.',
        },
        {
          id: 'qq_3',
          question: 'What are the roots of x² - 5x + 6 = 0?',
          options: ['x = -2, -3', 'x = 2, 3', 'x = 1, 6', 'x = -1, -6'],
          correctIndex: 1,
          explanation: '(x - 2)(x - 3) = 0 gives roots x = 2 and x = 3.',
        },
        {
          id: 'qq_4',
          question: 'The vertex of the parabola represented by y = ax² + bx + c has x-coordinate:',
          options: ['-b / (2a)', 'b / (2a)', '-c / a', 'b² - 4ac'],
          correctIndex: 0,
          explanation: 'The axis of symmetry and vertex x-coordinate is always at x = -b / (2a).',
        },
        {
          id: 'qq_5',
          question: 'What is the product of roots for the equation 3x² + 7x - 12 = 0?',
          options: ['-7/3', '7/3', '-4', '4'],
          correctIndex: 2,
          explanation: 'For ax² + bx + c = 0, product of roots = c / a = -12 / 3 = -4.',
        },
      ],
      createdAt: new Date().toISOString(),
    },
  ],
  quizResults: [
    {
      id: 'qr_demo_1',
      quizId: 'quiz_demo_1',
      userId: 'demo_user',
      subject: 'Mathematics',
      topic: 'Quadratic Equations',
      score: 4,
      totalQuestions: 5,
      percentage: 80,
      answers: [
        {
          questionId: 'qq_1',
          question: 'What is the discriminant of the quadratic equation 2x² - 4x + 2 = 0?',
          selectedIndex: 0,
          correctIndex: 0,
          isCorrect: true,
          explanation: 'Discriminant is 0.',
        },
        {
          questionId: 'qq_2',
          question: 'If the discriminant of a quadratic equation is negative, what nature of roots does it have?',
          selectedIndex: 2,
          correctIndex: 2,
          isCorrect: true,
          explanation: 'Roots are complex/imaginary.',
        },
        {
          questionId: 'qq_3',
          question: 'What are the roots of x² - 5x + 6 = 0?',
          selectedIndex: 1,
          correctIndex: 1,
          isCorrect: true,
          explanation: 'Roots are 2 and 3.',
        },
        {
          questionId: 'qq_4',
          question: 'The vertex of the parabola represented by y = ax² + bx + c has x-coordinate:',
          selectedIndex: 1,
          correctIndex: 0,
          isCorrect: false,
          explanation: 'Vertex x-coordinate is -b / (2a).',
        },
        {
          questionId: 'qq_5',
          question: 'What is the product of roots for the equation 3x² + 7x - 12 = 0?',
          selectedIndex: 2,
          correctIndex: 2,
          isCorrect: true,
          explanation: 'Product of roots = c / a = -4.',
        },
      ],
      weakTopics: ['Parabola Vertex Formula'],
      recommendation: 'Great job! You scored 80% on Quadratic Equations. Review the vertex formula -b/(2a) to get 100% next time.',
      completedAt: new Date(Date.now() - 14400000).toISOString(),
    },
  ],
  notes: [
    {
      id: 'note_demo_1',
      userId: 'demo_user',
      title: 'Cellular Respiration & ATP Synthesis',
      subject: 'Biology',
      originalText: 'Cellular respiration is a metabolic pathway that breaks down glucose and produces ATP. The stages include Glycolysis, Pyruvate oxidation, the Citric Acid (Krebs) cycle, and Oxidative Phosphorylation.',
      summary: 'Cellular respiration converts glucose into usable biochemical energy (ATP) through four sequential stages: Glycolysis (cytosol), Pyruvate Oxidation, Krebs Cycle (mitochondrial matrix), and Electron Transport Chain / Oxidative Phosphorylation (inner mitochondrial membrane).',
      keyPoints: [
        'Glycolysis occurs in cytoplasm and is anaerobic (yields 2 ATP net, 2 NADH).',
        'Krebs Cycle takes place in the mitochondrial matrix and produces electron carriers (NADH, FADH2).',
        'Oxidative Phosphorylation creates the bulk of ATP (around 28-32 ATP per glucose) via ATP Synthase and chemiosmosis.',
        'Oxygen acts as the terminal electron acceptor, forming water (H2O).',
      ],
      definitions: [
        { term: 'ATP', definition: 'Adenosine Triphosphate, the primary energy currency of the cell.' },
        { term: 'Chemiosmosis', definition: 'The movement of protons across a membrane down their electrochemical gradient to drive ATP synthesis.' },
        { term: 'Glycolysis', definition: 'The breakdown of glucose by enzymes, releasing energy and pyruvic acid.' },
      ],
      revisionNotes: [
        'Review the 10 enzyme steps of glycolysis.',
        'Contrast aerobic vs anaerobic fermentation (lactate vs ethanol).',
        'Remember that cyanide inhibits complex IV of the electron transport chain.',
      ],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  flashcards: [
    {
      id: 'fc_1',
      userId: 'demo_user',
      subject: 'Physics',
      topic: 'Electromagnetism',
      front: "What is Faraday's Law of Electromagnetic Induction?",
      back: 'The induced electromotive force (EMF) in any closed circuit is equal to the negative time rate of change of magnetic flux through the circuit (EMF = -dΦ/dt).',
      difficultyRating: 'easy',
      reviewCount: 3,
      lastReviewed: new Date().toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'fc_2',
      userId: 'demo_user',
      subject: 'Chemistry',
      topic: 'Equilibrium',
      front: "What does Le Chatelier's Principle state?",
      back: 'If a dynamic equilibrium is disturbed by changing the conditions (concentration, temperature, pressure), the position of equilibrium shifts to counteract the change.',
      difficultyRating: 'hard',
      reviewCount: 2,
      lastReviewed: new Date().toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'fc_3',
      userId: 'demo_user',
      subject: 'Mathematics',
      topic: 'Calculus',
      front: 'What is the derivative of f(x) = ln(x) for x > 0?',
      back: "f'(x) = 1 / x",
      difficultyRating: 'easy',
      reviewCount: 4,
      lastReviewed: new Date().toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  studyPlans: [
    {
      id: 'plan_demo_1',
      userId: 'demo_user',
      examName: 'Midterm Science & Math Board Exams',
      examDate: new Date(Date.now() + 18 * 86400000).toISOString().split('T')[0],
      daysRemaining: 18,
      subjects: ['Mathematics', 'Physics', 'Chemistry'],
      knowledgeLevel: 'intermediate',
      dailyHours: 2.5,
      completionPercentage: 42,
      tasks: [
        {
          id: 'spt_1',
          date: new Date().toISOString().split('T')[0],
          dayLabel: 'Today',
          subject: 'Mathematics',
          task: 'Master Quadratic Equations and complete a 5-question quiz',
          type: 'quiz',
          completed: true,
        },
        {
          id: 'spt_2',
          date: new Date().toISOString().split('T')[0],
          dayLabel: 'Today',
          subject: 'Physics',
          task: "Solve 3 practice problems on Newton's Laws of Motion",
          type: 'practice',
          completed: true,
        },
        {
          id: 'spt_3',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          dayLabel: 'Tomorrow',
          subject: 'Chemistry',
          task: 'Review Le Chatelier Principle and Equilibrium Constants',
          type: 'revision',
          completed: false,
        },
        {
          id: 'spt_4',
          date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
          dayLabel: 'Day 3',
          subject: 'Mathematics',
          task: 'Calculus: Derivatives of Trigonometric & Logarithmic functions',
          type: 'concept',
          completed: false,
        },
      ],
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ],
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading database file, using default seed:', err);
    }
    this.persist(defaultSeedData);
    return defaultSeedData;
  }

  private persist(dataToSave: DatabaseSchema) {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  }

  private save() {
    this.persist(this.data);
  }

  // Users
  getUserById(id: string): UserRecord | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): UserRecord | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: UserRecord): UserRecord {
    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUser(id: string, updates: Partial<UserRecord>): UserRecord | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // Questions
  saveQuestion(question: QuestionRecord): QuestionRecord {
    this.data.questions.unshift(question);
    // Update user stats
    const user = this.getUserById(question.userId);
    if (user) {
      user.questionsSolvedCount += 1;
      user.questionsSolvedToday += 1;
      this.updateUser(user.id, user);
    }
    this.save();
    return question;
  }

  getQuestionsByUserId(userId: string): QuestionRecord[] {
    return this.data.questions.filter((q) => q.userId === userId);
  }

  getQuestionById(id: string): QuestionRecord | undefined {
    return this.data.questions.find((q) => q.id === id);
  }

  // Saved Questions
  toggleSaveQuestion(userId: string, questionId: string): boolean {
    const existingIndex = this.data.savedQuestions.findIndex(
      (sq) => sq.userId === userId && sq.questionId === questionId
    );
    if (existingIndex >= 0) {
      this.data.savedQuestions.splice(existingIndex, 1);
      this.save();
      return false; // un-saved
    } else {
      this.data.savedQuestions.push({
        id: `sq_${Date.now()}`,
        userId,
        questionId,
        savedAt: new Date().toISOString(),
      });
      this.save();
      return true; // saved
    }
  }

  getSavedQuestions(userId: string): QuestionRecord[] {
    const savedIds = new Set(
      this.data.savedQuestions.filter((sq) => sq.userId === userId).map((sq) => sq.questionId)
    );
    return this.data.questions.filter((q) => savedIds.has(q.id));
  }

  isQuestionSaved(userId: string, questionId: string): boolean {
    return this.data.savedQuestions.some((sq) => sq.userId === userId && sq.questionId === questionId);
  }

  // Tutor Messages
  saveTutorMessage(msg: TutorMessageRecord): TutorMessageRecord {
    this.data.tutorMessages.push(msg);
    this.save();
    return msg;
  }

  getTutorMessages(userId: string, conversationId = 'default'): TutorMessageRecord[] {
    return this.data.tutorMessages.filter(
      (m) => m.userId === userId && m.conversationId === conversationId
    );
  }

  clearTutorMessages(userId: string, conversationId = 'default') {
    this.data.tutorMessages = this.data.tutorMessages.filter(
      (m) => !(m.userId === userId && m.conversationId === conversationId)
    );
    this.save();
  }

  // Quizzes & Results
  saveQuiz(quiz: QuizRecord): QuizRecord {
    this.data.quizzes.unshift(quiz);
    this.save();
    return quiz;
  }

  getQuizById(id: string): QuizRecord | undefined {
    return this.data.quizzes.find((q) => q.id === id);
  }

  saveQuizResult(result: QuizResultRecord): QuizResultRecord {
    this.data.quizResults.unshift(result);
    this.save();
    return result;
  }

  getQuizResults(userId: string): QuizResultRecord[] {
    return this.data.quizResults.filter((r) => r.userId === userId);
  }

  // Notes
  saveNote(note: NoteRecord): NoteRecord {
    this.data.notes.unshift(note);
    this.save();
    return note;
  }

  getNotesByUserId(userId: string): NoteRecord[] {
    return this.data.notes.filter((n) => n.userId === userId);
  }

  deleteNote(id: string, userId: string): boolean {
    const lenBefore = this.data.notes.length;
    this.data.notes = this.data.notes.filter((n) => !(n.id === id && n.userId === userId));
    this.save();
    return this.data.notes.length < lenBefore;
  }

  // Flashcards
  saveFlashcard(card: FlashcardRecord): FlashcardRecord {
    this.data.flashcards.unshift(card);
    this.save();
    return card;
  }

  getFlashcardsByUserId(userId: string): FlashcardRecord[] {
    return this.data.flashcards.filter((f) => f.userId === userId);
  }

  updateFlashcard(id: string, updates: Partial<FlashcardRecord>): FlashcardRecord | undefined {
    const idx = this.data.flashcards.findIndex((f) => f.id === id);
    if (idx === -1) return undefined;
    this.data.flashcards[idx] = { ...this.data.flashcards[idx], ...updates };
    this.save();
    return this.data.flashcards[idx];
  }

  deleteFlashcard(id: string, userId: string): boolean {
    const lenBefore = this.data.flashcards.length;
    this.data.flashcards = this.data.flashcards.filter((f) => !(f.id === id && f.userId === userId));
    this.save();
    return this.data.flashcards.length < lenBefore;
  }

  // Study Plans
  saveStudyPlan(plan: StudyPlanRecord): StudyPlanRecord {
    this.data.studyPlans.unshift(plan);
    this.save();
    return plan;
  }

  getStudyPlansByUserId(userId: string): StudyPlanRecord[] {
    return this.data.studyPlans.filter((p) => p.userId === userId);
  }

  updateStudyPlanTask(planId: string, taskId: string, completed: boolean): StudyPlanRecord | undefined {
    const plan = this.data.studyPlans.find((p) => p.id === planId);
    if (!plan) return undefined;
    const task = plan.tasks.find((t) => t.id === taskId);
    if (task) {
      task.completed = completed;
      const total = plan.tasks.length;
      const done = plan.tasks.filter((t) => t.completed).length;
      plan.completionPercentage = total > 0 ? Math.round((done / total) * 100) : 0;
      this.save();
    }
    return plan;
  }

  // Real-time Progress Analytics for Student
  getProgressSummary(userId: string): ProgressSummaryRecord {
    const user = this.getUserById(userId);
    const questions = this.getQuestionsByUserId(userId);
    const quizResults = this.getQuizResults(userId);
    const notes = this.getNotesByUserId(userId);
    const flashcards = this.getFlashcardsByUserId(userId);

    const questionsSolved = questions.length;
    const quizzesCompleted = quizResults.length;
    const averageQuizScore =
      quizzesCompleted > 0
        ? Math.round(quizResults.reduce((acc, q) => acc + q.percentage, 0) / quizzesCompleted)
        : 0;

    const studyStreak = user?.streakDays || 1;
    const studyTimeMinutes =
      questionsSolved * 6 + quizzesCompleted * 12 + notes.length * 8 + flashcards.length * 3;

    // Aggregate subjects studied
    const subjectMap = new Map<string, { count: number; totalScore: number; scoreCount: number }>();
    for (const q of questions) {
      const s = q.subject || 'General STEM';
      const curr = subjectMap.get(s) || { count: 0, totalScore: 0, scoreCount: 0 };
      curr.count += 1;
      subjectMap.set(s, curr);
    }
    for (const qr of quizResults) {
      const s = qr.subject || 'General STEM';
      const curr = subjectMap.get(s) || { count: 0, totalScore: 0, scoreCount: 0 };
      curr.count += 1;
      curr.totalScore += qr.percentage;
      curr.scoreCount += 1;
      subjectMap.set(s, curr);
    }

    const subjectsStudied = Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      count: data.count,
      accuracy: data.scoreCount > 0 ? Math.round(data.totalScore / data.scoreCount) : 85,
    }));

    // Strong & weak topics based on real quiz performance
    const strongSet = new Set<string>();
    const weakSet = new Set<string>();
    for (const qr of quizResults) {
      if (qr.percentage >= 80) {
        strongSet.add(qr.topic);
      } else {
        weakSet.add(qr.topic);
      }
    }
    const strongTopics = Array.from(strongSet);
    const weakTopics = Array.from(weakSet);

    // Recent activity log
    const recentActivity: ProgressSummaryRecord['recentActivity'] = [];
    for (const q of questions.slice(0, 3)) {
      recentActivity.push({
        id: q.id,
        type: 'question',
        title: q.questionText.slice(0, 45) + (q.questionText.length > 45 ? '...' : ''),
        subtitle: `${q.subject} · ${q.topic}`,
        timestamp: q.createdAt,
      });
    }
    for (const qr of quizResults.slice(0, 2)) {
      recentActivity.push({
        id: qr.id,
        type: 'quiz',
        title: `${qr.topic} Quiz (${qr.percentage}%)`,
        subtitle: `${qr.subject} · ${qr.score}/${qr.totalQuestions} correct`,
        timestamp: qr.completedAt,
      });
    }
    for (const n of notes.slice(0, 2)) {
      recentActivity.push({
        id: n.id,
        type: 'note',
        title: n.title,
        subtitle: `${n.subject} · Revision summary`,
        timestamp: n.createdAt,
      });
    }

    // Dynamic smart recommendations
    const recommendations: ProgressSummaryRecord['recommendations'] = [];
    if (weakTopics.length > 0) {
      const topWeak = weakTopics[0];
      const matchingQuiz = quizResults.find((qr) => qr.topic === topWeak);
      recommendations.push({
        id: `rec_weak_${topWeak}`,
        title: `${topWeak}: Concept Booster`,
        description: `Your last quiz score indicated room for growth in ${topWeak}. Reviewing key definitions and retaking a focused quiz will solidify your mastery.`,
        actionType: 'quiz',
        subject: matchingQuiz?.subject || 'STEM',
        topic: topWeak,
      });
    } else if (questionsSolved > 0) {
      const lastQ = questions[0];
      recommendations.push({
        id: `rec_practice_${lastQ.topic}`,
        title: `Test Knowledge: ${lastQ.topic}`,
        description: `You recently solved problems in ${lastQ.topic}. Reinforce what you learned with a quick 5-question evaluation.`,
        actionType: 'quiz',
        subject: lastQ.subject,
        topic: lastQ.topic,
      });
    } else {
      recommendations.push({
        id: 'rec_welcome',
        title: 'Start with your First Problem',
        description: 'Scan an equation from your notes or type a homework question to see Solvo AI breakdown the solution step-by-step.',
        actionType: 'practice',
        subject: 'General Science',
        topic: 'Problem Solving',
      });
    }

    return {
      questionsSolved,
      quizzesCompleted,
      averageQuizScore,
      studyStreak,
      studyTimeMinutes,
      subjectsStudied,
      strongTopics,
      weakTopics,
      recentActivity,
      recommendations,
    };
  }
}

export const db = new Database();
