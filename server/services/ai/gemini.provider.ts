import type {
  IAIProvider,
  SolveQuestionInput,
  SolveQuestionResult,
  ChatTutorInput,
  ChatTutorResult,
  GenerateQuizInput,
  GenerateQuizResult,
  SummarizeNotesInput,
  SummarizeNotesResult,
  GenerateFlashcardsInput,
  GenerateFlashcardsResult,
  GenerateStudyPlanInput,
  GenerateStudyPlanResult,
} from './ai.interface.ts';
import { HeuristicAIProvider } from './heuristic.provider.ts';

export class GeminiAIProvider implements IAIProvider {
  private apiKey: string;
  private fallback: HeuristicAIProvider;
  private candidateModels: string[] = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.fallback = new HeuristicAIProvider();
  }

  private async callGemini(contents: any[], systemInstruction?: string): Promise<string> {
    let lastError: any = null;

    for (const model of this.candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
        const body: any = { contents };

        if (systemInstruction) {
          body.systemInstruction = {
            parts: [{ text: systemInstruction }],
          };
        }

        body.generationConfig = {
          temperature: 0.3,
          topP: 0.95,
          responseMimeType: 'application/json',
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(6000),
        });

        if (response.ok) {
          const data = await response.json();
          const candidate = data.candidates?.[0];
          const text = candidate?.content?.parts?.[0]?.text;
          if (text) return text;
        }

        const errText = await response.text();
        lastError = new Error(`Gemini ${model} error ${response.status}: ${errText.slice(0, 200)}`);
      } catch (err: any) {
        lastError = err;
      }
    }

    throw lastError || new Error('All Gemini models failed or timed out');
  }

  async solveQuestion(input: SolveQuestionInput): Promise<SolveQuestionResult> {
    // Fast-path: deterministic math & science engine solves pure arithmetic & linear problems with 100% accuracy
    if (!input.imageBase64 && input.questionText) {
      const directMath = await this.fallback.solveQuestion(input);
      if (directMath && directMath.finalAnswer && !directMath.finalAnswer.startsWith('Verified Solution for:')) {
        return directMath;
      }
    }

    try {
      const parts: any[] = [];

      if (input.imageBase64) {
        // Strip data:image/...;base64, prefix if present
        const cleanBase64 = input.imageBase64.replace(/^data:image\/[a-z0-9]+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: input.mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        });
      }

      const promptText = `
Analyze the academic problem presented in the text or image.
Question Text provided: "${input.questionText || ''}"
Preferred Language: "${input.preferredLanguage || 'en'}"

Return a JSON object conforming STRICTLY to this schema:
{
  "subject": "Mathematics | Physics | Chemistry | Biology | Urdu | General Science",
  "topic": "Specific academic topic (e.g. Quadratic Equations, Newton's Laws)",
  "questionText": "Transcribed clear question statement",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Clear educational action step title",
      "content": "Detailed step explanation and arithmetic/formula derivation",
      "keyRuleOrFormula": "Formula or axiom applied (optional)"
    }
  ],
  "finalAnswer": "Precise, verified final answer in bold academic form",
  "explanation": "Deep conceptual explanation explaining WHY this solution works",
  "urduExplanation": "اردو میں تفصیلی اور آسان فہم وضاحت",
  "simplerExplanation": "Explain simpler in easy everyday language for a beginner",
  "alternativeMethod": {
    "title": "Name of alternative method (e.g. Quadratic Formula, Geometric, Graphical)",
    "steps": ["Step 1", "Step 2", "Step 3"],
    "finalAnswer": "Final answer via alternative method"
  },
  "similarPracticeQuestion": {
    "question": "A closely related practice question with different numbers",
    "hint": "Helpful hint for solving it",
    "answer": "Correct answer for the practice question",
    "explanation": "Brief explanation of how to solve the practice question"
  }
}
Do NOT output code fences or extra text, only valid JSON.
`;
      parts.push({ text: promptText });

      const rawJson = await this.callGemini(
        [{ role: 'user', parts }],
        'You are Solvo, an expert educational AI tutor. You provide clear, rigorous, and student-friendly step-by-step solutions without exposing internal chain-of-thought.'
      );

      const parsed = JSON.parse(rawJson);
      return parsed as SolveQuestionResult;
    } catch (err: any) {
      console.warn('Gemini solver encountered an error, activating resilient heuristic fallback:', err.message);
      return this.fallback.solveQuestion(input);
    }
  }

  async chatTutor(input: ChatTutorInput): Promise<ChatTutorResult> {
    try {
      const isUrdu = input.language === 'ur' || /urdu|اردو/i.test(input.message);

      const systemInstruction = `
You are Solvo, "Your AI Study Buddy", a patient, friendly, highly intelligent education assistant for students.
You explain concepts simply, give clear examples, provide analogies, and adapt to the student's needs.
You support both English and Urdu fluently.
Respond in JSON:
{
  "text": "Your helpful response string (in Urdu if language is urdu or user asked in Urdu, otherwise in English)",
  "language": "en" or "ur",
  "quickActions": ["4 short follow-up action pill suggestions, e.g. 'Explain simpler', 'Give an example', 'Quiz me', 'Explain in Urdu'"]
}
`;

      const contents = input.history.map((h) => ({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      }));

      contents.push({
        role: 'user',
        parts: [{ text: `User Message: ${input.message}\nCurrent Language: ${isUrdu ? 'Urdu' : 'English'}` }],
      });

      const rawJson = await this.callGemini(contents, systemInstruction);
      const parsed = JSON.parse(rawJson);
      return {
        text: parsed.text,
        language: parsed.language || (isUrdu ? 'ur' : 'en'),
        quickActions: parsed.quickActions || ['Explain simpler', 'Give an example', 'Quiz me', 'Explain in Urdu'],
      };
    } catch (err: any) {
      console.warn('Gemini chat tutor error, falling back:', err.message);
      return this.fallback.chatTutor(input);
    }
  }

  async generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizResult> {
    try {
      const prompt = `
Generate an academic multiple-choice quiz for students.
Subject: ${input.subject}
Topic: ${input.topic}
Difficulty: ${input.difficulty}
Number of questions: ${input.questionCount}

Return JSON strictly matching this schema:
{
  "subject": "${input.subject}",
  "topic": "${input.topic}",
  "difficulty": "${input.difficulty}",
  "questions": [
    {
      "id": "q_1",
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Detailed explanation explaining why Option A is correct and why other options are incorrect."
    }
  ]
}
`;

      const rawJson = await this.callGemini(
        [{ role: 'user', parts: [{ text: prompt }] }],
        'You are an expert curriculum test designer. Generate accurate, balanced, educational multiple-choice questions.'
      );

      const parsed = JSON.parse(rawJson);
      return parsed as GenerateQuizResult;
    } catch (err: any) {
      console.warn('Gemini quiz generator error, falling back:', err.message);
      return this.fallback.generateQuiz(input);
    }
  }

  async summarizeNotes(input: SummarizeNotesInput): Promise<SummarizeNotesResult> {
    try {
      const prompt = `
Analyze the provided study document / notes.
Title: ${input.title || 'Study Material'}
Content:
"""
${input.content}
"""

Return JSON:
{
  "title": "${input.title || 'Study Summary'}",
  "subject": "Detected subject",
  "summary": "Clear executive summary of the entire text",
  "keyPoints": ["Bullet point 1", "Bullet point 2", "Bullet point 3", "Bullet point 4"],
  "definitions": [
    {"term": "Term 1", "definition": "Clear concise definition"},
    {"term": "Term 2", "definition": "Clear concise definition"}
  ],
  "revisionNotes": ["Revision tip 1", "Revision tip 2", "High-yield exam tip"]
}
`;
      const rawJson = await this.callGemini([{ role: 'user', parts: [{ text: prompt }] }]);
      const parsed = JSON.parse(rawJson);
      return parsed as SummarizeNotesResult;
    } catch (err: any) {
      console.warn('Gemini notes summarizer error, falling back:', err.message);
      return this.fallback.summarizeNotes(input);
    }
  }

  async generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsResult> {
    try {
      const count = input.count || 4;
      const prompt = `
Create ${count} high-yield study flashcards from the following content:
Content: "${input.sourceText}"
Subject: ${input.subject || 'General'}
Topic: ${input.topic || 'Key Concepts'}

Return JSON:
{
  "cards": [
    {
      "front": "Question or term on the front of the card",
      "back": "Clear, memorable answer on the back",
      "subject": "${input.subject || 'General'}",
      "topic": "${input.topic || 'Key Concepts'}"
    }
  ]
}
`;
      const rawJson = await this.callGemini([{ role: 'user', parts: [{ text: prompt }] }]);
      const parsed = JSON.parse(rawJson);
      return parsed as GenerateFlashcardsResult;
    } catch (err: any) {
      console.warn('Gemini flashcard generator error, falling back:', err.message);
      return this.fallback.generateFlashcards(input);
    }
  }

  async generateStudyPlan(input: GenerateStudyPlanInput): Promise<GenerateStudyPlanResult> {
    try {
      const prompt = `
Create an exam study plan for a student:
Exam: ${input.examName}
Exam Date: ${input.examDate}
Subjects: ${input.subjects.join(', ')}
Knowledge Level: ${input.knowledgeLevel}
Daily Study Hours: ${input.dailyHours}

Generate a structured daily task checklist for the next 7 days in JSON:
{
  "tasks": [
    {
      "id": "task_1",
      "date": "YYYY-MM-DD",
      "dayLabel": "Today | Tomorrow | Day 3 ...",
      "subject": "Subject Name",
      "task": "Specific actionable study task",
      "type": "concept | revision | quiz | practice",
      "completed": false
    }
  ]
}
`;
      const rawJson = await this.callGemini([{ role: 'user', parts: [{ text: prompt }] }]);
      const parsed = JSON.parse(rawJson);
      return parsed as GenerateStudyPlanResult;
    } catch (err: any) {
      console.warn('Gemini study plan error, falling back:', err.message);
      return this.fallback.generateStudyPlan(input);
    }
  }
}
