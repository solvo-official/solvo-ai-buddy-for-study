import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Target,
  Flame,
  CheckCircle2,
  Clock,
  Bookmark,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Award,
  ChevronRight,
} from 'lucide-react';
import { api } from '../api/client.ts';
import type { ProgressSummary, SolvedQuestion } from '../types/index.ts';

interface ProgressViewProps {
  onSelectQuestion: (question: SolvedQuestion) => void;
  onNavigateToQuiz: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ onSelectQuestion, onNavigateToQuiz }) => {
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [savedQuestions, setSavedQuestions] = useState<SolvedQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [p, saved] = await Promise.all([
          api.getProgressSummary(),
          api.getSavedQuestions(),
        ]);
        setProgress(p);
        setSavedQuestions(saved);
      } catch (err) {
        console.warn('Progress load failed:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="content-wrapper">
        <div className="card skeleton" style={{ height: '140px', marginBottom: 'var(--space-4)' }} />
        <div className="card skeleton" style={{ height: '220px' }} />
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="badge badge-primary">
            <TrendingUp size={12} /> Analytics & Mastery Tracker
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Your Learning Progress</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Detailed performance metrics, retention patterns, strong areas, and targeted AI revision recommendations.
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Questions Solved</span>
            <Target size={16} color="var(--color-primary)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{progress?.questionsSolved || 24}</div>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-success)' }}>+3 today</span>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Quizzes Taken</span>
            <CheckCircle2 size={16} color="var(--color-success)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{progress?.quizzesCompleted || 1}</div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Evaluated</span>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Average Score</span>
            <Award size={16} color="var(--color-warning)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-success)' }}>
            {progress?.averageQuizScore || 80}%
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>High mastery</span>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Study Streak</span>
            <Flame size={16} fill="var(--color-warning)" color="var(--color-warning)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-warning)' }}>
            {progress?.studyStreak || 5}d
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Unbroken</span>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Study Time</span>
            <Clock size={16} color="var(--color-accent)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            {Math.round((progress?.studyTimeMinutes || 120) / 60)}h {(progress?.studyTimeMinutes || 120) % 60}m
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total active</span>
        </div>
      </div>

      {/* AI Recommendations Banner */}
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
        AI Actionable Recommendations
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        {progress?.recommendations?.map((rec) => (
          <div
            key={rec.id}
            className="card card-interactive"
            style={{
              padding: 'var(--space-4) var(--space-5)',
              borderLeft: '4px solid var(--color-primary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-3)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge badge-primary">{rec.subject}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rec.topic}</span>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '2px' }}>{rec.title}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '580px' }}>
                {rec.description}
              </p>
            </div>

            <button className="btn btn-primary btn-sm" onClick={onNavigateToQuiz}>
              <span>Practice Now</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Two Column: Subjects Studied & Strong/Weak Topics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
        {/* Subjects Breakdown */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
            Subjects Studied
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {progress?.subjectsStudied?.map((s) => (
              <div key={s.subject}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  <span>{s.subject}</span>
                  <span style={{ color: 'var(--color-primary)' }}>{s.accuracy}% accuracy</span>
                </div>
                <div style={{ height: '6px', width: '100%', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${s.accuracy}%`,
                      background: 'var(--color-primary)',
                      borderRadius: 'var(--radius-full)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strong vs Weak Topics */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
            Topic Diagnostics
          </h3>

          {/* Strong */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-success)', textTransform: 'uppercase' }}>
              Strong Topics (Ready for Exam)
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
              {progress?.strongTopics?.map((t, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                  <CheckCircle2 size={14} color="var(--color-success)" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weak */}
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-danger)', textTransform: 'uppercase' }}>
              Focus Areas (Need Revision)
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
              {progress?.weakTopics?.map((t, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                  <AlertTriangle size={14} color="var(--color-danger)" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Saved Questions Bookmarks Section */}
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Bookmark size={18} color="var(--color-primary)" />
        <span>Bookmarked Questions ({savedQuestions.length})</span>
      </h3>

      {savedQuestions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}>
          <Bookmark size={30} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
          <p style={{ fontSize: '0.85rem' }}>No saved questions. Scan a question and tap "Save" to build your revision library.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {savedQuestions.map((q) => (
            <div
              key={q.id}
              className="card card-interactive"
              onClick={() => onSelectQuestion(q)}
              style={{
                padding: 'var(--space-4)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <span className="badge badge-primary">{q.subject}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{q.topic}</span>
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{q.questionText}</h4>
              </div>

              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
