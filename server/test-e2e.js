// Questrix Comprehensive End-to-End Automated Integration Test Suite
const BASE = 'http://localhost:5000';

async function runTests() {
  console.log('====================================================');
  console.log('  STARTING QUESTRIX END-TO-END AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`[TEST] ${name} ... `);
      await fn();
      console.log('PASSED ✓');
      passed++;
    } catch (err) {
      console.log(`FAILED ✗\n  Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Root & Static HTML Serving
  await test('Root HTML serving (SPA entrypoint)', async () => {
    const res = await fetch(`${BASE}/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    if (!html.includes('Questrix')) throw new Error('Missing Questrix title in HTML');
    if (!html.includes('id="root"')) throw new Error('Missing React root mount point');
  });

  // 2. Auth - Guest Login
  let guestToken = '';
  await test('Guest authentication flow', async () => {
    const res = await fetch(`${BASE}/api/auth/guest`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.user || !data.token) throw new Error('Invalid user or token returned');
    guestToken = data.token;
  });

  // 3. Auth - Profile retrieval
  await test('Profile retrieval with token', async () => {
    const res = await fetch(`${BASE}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${guestToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.user.name) throw new Error('Profile missing user name');
  });

  // 4. AI Question Solver (Text problem)
  let solvedQuestionId = '';
  await test('AI Question Solver (Quadratic Equation via text)', async () => {
    const res = await fetch(`${BASE}/api/ai/solve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guestToken}`,
      },
      body: JSON.stringify({ questionText: 'Solve 2x^2 - 7x + 3 = 0' }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.question.finalAnswer) throw new Error('Missing final answer');
    if (!data.question.steps || data.question.steps.length === 0) throw new Error('Missing solution steps');
    if (!data.question.urduExplanation) throw new Error('Missing Urdu explanation');
    solvedQuestionId = data.question.id;
  });

  // 5. Bookmark / Save Question
  await test('Save / Bookmark question', async () => {
    const res = await fetch(`${BASE}/api/questions/${solvedQuestionId}/save`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${guestToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (typeof data.isSaved !== 'boolean') throw new Error('Expected boolean isSaved');
  });

  // 6. AI Tutor Multi-turn Chat (English)
  await test('AI Tutor conversational reply (English)', async () => {
    const res = await fetch(`${BASE}/api/tutor/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guestToken}`,
      },
      body: JSON.stringify({ message: 'Explain Newton second law simpler', language: 'en' }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.message.text) throw new Error('Empty response from AI Tutor');
    if (!data.message.quickActions) throw new Error('Missing quick action pills');
  });

  // 7. AI Tutor Multi-turn Chat (Urdu)
  await test('AI Tutor conversational reply (Urdu)', async () => {
    const res = await fetch(`${BASE}/api/tutor/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guestToken}`,
      },
      body: JSON.stringify({ message: 'کیا آپ مجھے فزکس کا کوئی اصول اردو میں سمجھا سکتے ہیں؟', language: 'ur' }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.message.text) throw new Error('Empty response from AI Tutor in Urdu');
  });

  // 8. Quiz Generator
  let generatedQuizId = '';
  await test('AI Quiz Generator (3 Questions on Mechanics)', async () => {
    const res = await fetch(`${BASE}/api/quizzes/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guestToken}`,
      },
      body: JSON.stringify({
        subject: 'Physics',
        topic: "Newton's Laws",
        difficulty: 'medium',
        questionCount: 3,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.quiz.questions || data.quiz.questions.length < 3) throw new Error('Incorrect question count');
    generatedQuizId = data.quiz.id;
  });

  // 9. Quiz Submission & Scoring
  await test('Quiz submission, scoring, and recommendation generation', async () => {
    const answers = [
      { questionId: 'q_phys_1', selectedIndex: 2 },
      { questionId: 'q_phys_2', selectedIndex: 1 },
      { questionId: 'q_phys_3', selectedIndex: 0 }, // intentional wrong answer
    ];
    const res = await fetch(`${BASE}/api/quizzes/${generatedQuizId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guestToken}`,
      },
      body: JSON.stringify({ answers }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (typeof data.result.percentage !== 'number') throw new Error('Missing percentage');
    if (!data.result.recommendation) throw new Error('Missing AI recommendation');
  });

  // 10. Notes & Document Summarizer
  await test('Notes Summarizer (text analysis)', async () => {
    const res = await fetch(`${BASE}/api/notes/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guestToken}`,
      },
      body: JSON.stringify({
        title: 'Cell Biology Notes',
        subject: 'Biology',
        content: 'Mitochondria are membrane-bound cell organelles that generate most of the chemical energy needed to power the cell biochemical reactions. Chemical energy produced by the mitochondria is stored in a small molecule called adenosine triphosphate (ATP).',
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.note.summary) throw new Error('Missing summary');
    if (!data.note.keyPoints || data.note.keyPoints.length === 0) throw new Error('Missing key points');
  });

  // 11. Flashcards Generation & Review
  let cardId = '';
  await test('Flashcards generation and spaced repetition review', async () => {
    const res = await fetch(`${BASE}/api/flashcards/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guestToken}`,
      },
      body: JSON.stringify({
        sourceText: 'Calculus Derivatives and Chain Rule',
        subject: 'Mathematics',
        topic: 'Calculus',
        count: 2,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.cards || data.cards.length === 0) throw new Error('Missing generated cards');
    cardId = data.cards[0].id;

    // Review card
    const revRes = await fetch(`${BASE}/api/flashcards/${cardId}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guestToken}`,
      },
      body: JSON.stringify({ rating: 'easy' }),
    });
    if (!revRes.ok) throw new Error('Card review failed');
  });

  // 12. Exam Planner
  await test('Exam Planner generation and task toggle', async () => {
    const planRes = await fetch(`${BASE}/api/planner/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guestToken}`,
      },
      body: JSON.stringify({
        examName: 'Midterm Board Exam',
        examDate: '2026-10-15',
        subjects: ['Mathematics', 'Physics'],
        knowledgeLevel: 'intermediate',
        dailyHours: 2,
      }),
    });
    if (!planRes.ok) throw new Error(`HTTP ${planRes.status}`);
    const planData = await planRes.json();
    if (!planData.plan.tasks || planData.plan.tasks.length === 0) throw new Error('Missing plan tasks');

    const firstTask = planData.plan.tasks[0];
    const toggleRes = await fetch(`${BASE}/api/planner/${planData.plan.id}/tasks/${firstTask.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guestToken}`,
      },
      body: JSON.stringify({ completed: true }),
    });
    if (!toggleRes.ok) throw new Error('Failed to toggle task');
  });

  // 13. Progress Summary & Recommendations
  await test('Progress Summary dashboard data', async () => {
    const res = await fetch(`${BASE}/api/progress/summary`, {
      headers: { Authorization: `Bearer ${guestToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (typeof data.summary.questionsSolved !== 'number') throw new Error('Missing questionsSolved');
    if (!data.summary.recommendations || data.summary.recommendations.length === 0) throw new Error('Missing recommendations');
  });

  // 14. Entitlements & Full Access verification
  await test('Entitlements and Full Access verification', async () => {
    const entRes = await fetch(`${BASE}/api/entitlements`, {
      headers: { Authorization: `Bearer ${guestToken}` },
    });
    if (!entRes.ok) throw new Error(`HTTP ${entRes.status}`);
    const ent = await entRes.json();
    if (ent.limits.dailyScansLimit < 1000) throw new Error('Expected full unlimited scans limit');

    // Upgrade route compatibility
    const upgRes = await fetch(`${BASE}/api/subscription/upgrade`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${guestToken}` },
    });
    if (!upgRes.ok) throw new Error('Upgrade call failed');
    const upg = await upgRes.json();
    if (upg.user.plan !== 'premium') throw new Error('Expected premium user plan');
  });

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

runTests();
