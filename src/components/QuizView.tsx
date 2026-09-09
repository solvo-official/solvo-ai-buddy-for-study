import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Trophy,
  AlertTriangle,
  ChevronRight,
  Clock,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api/client.ts';
import type { Quiz, QuizResult } from '../types/index.ts';

export const QuizView: React.FC = () => {
  // Screen state: 'config' | 'taking' | 'review'
  const [screen, setScreen] = useState<'config' | 'taking' | 'review'>('config');

  // Config inputs
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('Quadratic Equations');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active quiz state
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Review state
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [pastResults, setPastResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    loadPastResults();
  }, []);

  const loadPastResults = async () => {
    try {
      const results = await api.getQuizResults();
      setPastResults(results);
    } catch (err) {
      console.warn('Failed to load past quiz results:', err);
    }
  };

  const handleStartQuiz = async () => {
    if (!subject || !topic.trim()) {
      setError('Please specify both subject and topic.');
      return;
    }
    setError(null);
    setIsGenerating(true);

    try {
      const quiz = await api.generateQuiz({
        subject,
        topic: topic.trim(),
        difficulty,
        questionCount,
      });

      setCurrentQuiz(quiz);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setScreen('taking');
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (!currentQuiz) return;
    const q = currentQuiz.questions[currentQuestionIndex];
    setUserAnswers((prev) => ({ ...prev, [q.id]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (!currentQuiz || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const answersPayload = Object.entries(userAnswers).map(([questionId, selectedIndex]) => ({
        questionId,
        selectedIndex,
      }));

      const result = await api.submitQuiz(currentQuiz.id, answersPayload);
      setQuizResult(result);
      setScreen('review');
      loadPastResults();

      // Trigger celebratory confetti if passed
      if (result.percentage >= 70) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      alert('Failed to submit quiz: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // VIEW 1: QUIZ CONFIGURATION
  // -------------------------------------------------------------
  if (screen === 'config') {
    return (
      <div className="content-wrapper">
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary">
              <CheckCircle2 size={12} /> Adaptive Testing
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>AI Quiz Generator</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Create customized curriculum quizzes to test retention, locate knowledge gaps, and track progress.
          </p>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '10px', marginBottom: 'var(--space-4)' }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
            Configure New Quiz
          </h3>

          {/* Subject selector */}
          <div className="input-group">
            <label className="input-label">Select Subject</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Urdu'].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`btn btn-sm ${subject === s ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSubject(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Topic input */}
          <div className="input-group">
            <label className="input-label" htmlFor="topic-input">Specific Topic</label>
            <input
              id="topic-input"
              className="input-field"
              type="text"
              placeholder="e.g. Quadratic Equations, Newton's Laws, Periodic Table..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {/* Difficulty & Count */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
            <div>
              <label className="input-label">Difficulty</label>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {(['easy', 'medium', 'hard'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`btn btn-sm ${difficulty === d ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, textTransform: 'capitalize' }}
                    onClick={() => setDifficulty(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="input-label">Number of Questions</label>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {[3, 5, 10].map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`btn btn-sm ${questionCount === c ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => setQuestionCount(c)}
                  >
                    {c} Questions
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', fontWeight: 700 }}
            onClick={handleStartQuiz}
            disabled={isGenerating}
          >
            <Sparkles size={18} />
            <span>{isGenerating ? 'Generating Quiz with AI...' : 'Generate & Start Quiz'}</span>
          </button>
        </div>

        {/* Past Quiz History */}
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
          Past Quiz Attempts
        </h3>

        {pastResults.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}>
            <HelpCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.85rem' }}>No quizzes taken yet. Complete your first quiz above to track your mastery!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {pastResults.map((res) => (
              <div
                key={res.id}
                className="card"
                style={{
                  padding: 'var(--space-4)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span className="badge badge-primary">{res.subject}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{res.topic}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Score: {res.score} / {res.totalQuestions} ({res.percentage}%)
                  </span>
                </div>

                <div
                  className={`badge ${
                    res.percentage >= 80
                      ? 'badge-success'
                      : res.percentage >= 60
                      ? 'badge-warning'
                      : 'badge-danger'
                  }`}
                  style={{ fontSize: '0.85rem', padding: '4px 10px', fontWeight: 800 }}
                >
                  {res.percentage}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: ACTIVE TEST TAKING
  // -------------------------------------------------------------
  if (screen === 'taking' && currentQuiz) {
    const q = currentQuiz.questions[currentQuestionIndex];
    const totalQuestions = currentQuiz.questions.length;
    const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);
    const selectedOption = userAnswers[q.id];
    const isAnswered = selectedOption !== undefined;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

    return (
      <div className="content-wrapper">
        {/* Progress Bar & Header */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                if (confirm('Are you sure you want to exit the quiz? Progress will be lost.')) {
                  setScreen('config');
                }
              }}
            >
              Exit Quiz
            </button>
          </div>

          <div style={{ height: '6px', width: '100%', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: 'var(--color-primary)',
                transition: 'width 250ms ease',
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className="badge badge-primary">{currentQuiz.subject}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currentQuiz.topic}</span>
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.5, marginBottom: 'var(--space-5)' }}>
            {q.question}
          </h2>

          {/* 4 Choices */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {q.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const letters = ['A', 'B', 'C', 'D'];

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  className="card"
                  style={{
                    padding: 'var(--space-4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-default)',
                    background: isSelected ? 'var(--color-primary-light)' : 'var(--bg-surface)',
                    boxShadow: isSelected ? '0 0 0 2px var(--color-primary)' : 'var(--shadow-xs)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 'var(--radius-full)',
                      background: isSelected ? 'var(--color-primary)' : 'var(--bg-surface-subtle)',
                      color: isSelected ? 'white' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      flexShrink: 0,
                    }}
                  >
                    {letters[idx]}
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: isSelected ? 600 : 400, color: 'var(--text-primary)' }}>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
          >
            Previous
          </button>

          {isLastQuestion ? (
            <button
              className="btn btn-primary btn-lg"
              disabled={!isAnswered || isSubmitting}
              onClick={handleSubmitQuiz}
            >
              <CheckCircle2 size={18} />
              <span>{isSubmitting ? 'Grading Answers...' : 'Submit & See Score'}</span>
            </button>
          ) : (
            <button
              className="btn btn-primary"
              disabled={!isAnswered}
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: POST-QUIZ REVIEW & SCORE
  // -------------------------------------------------------------
  if (screen === 'review' && quizResult) {
    const isPassed = quizResult.percentage >= 70;

    return (
      <div className="content-wrapper">
        {/* Score Card */}
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: 'var(--space-8) var(--space-4)',
            marginBottom: 'var(--space-6)',
            background: isPassed
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(14, 165, 233, 0.08))'
              : 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.08))',
            borderColor: isPassed ? 'var(--color-success-border)' : 'var(--color-warning-border)',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 'var(--radius-full)',
              background: isPassed ? 'var(--color-success-light)' : 'var(--color-warning-light)',
              color: isPassed ? 'var(--color-success)' : 'var(--color-warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-3)',
            }}
          >
            <Trophy size={36} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '4px' }}>
            {isPassed ? 'Outstanding Work!' : 'Good Effort! Keep Practicing'}
          </h2>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: isPassed ? 'var(--color-success)' : 'var(--color-warning)' }}>
            {quizResult.percentage}%
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
            You scored {quizResult.score} out of {quizResult.totalQuestions} questions correctly.
          </p>

          <p
            style={{
              maxWidth: '520px',
              margin: '0 auto',
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              background: 'var(--bg-surface-glass)',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <strong>Solvo AI Recommendation:</strong> {quizResult.recommendation}
          </p>
        </div>

        {/* Question by Question Review */}
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
          Detailed Answer Breakdown
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          {quizResult.answers.map((ans, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                borderLeft: `4px solid ${ans.isCorrect ? 'var(--color-success)' : 'var(--color-danger)'}`,
                padding: 'var(--space-5)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                {ans.isCorrect ? (
                  <CheckCircle2 size={18} color="var(--color-success)" />
                ) : (
                  <XCircle size={18} color="var(--color-danger)" />
                )}
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: ans.isCorrect ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  Question {idx + 1} • {ans.isCorrect ? 'CORRECT' : 'INCORRECT'}
                </span>
              </div>

              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '10px' }}>
                {ans.question}
              </h4>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-surface-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                <strong>Explanation:</strong> {ans.explanation}
              </p>
            </div>
          ))}
        </div>

        {/* Return Button */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
          <button className="btn btn-primary btn-lg" onClick={() => setScreen('config')}>
            <RotateCcw size={16} />
            <span>Try Another Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};
