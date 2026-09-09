import React, { useState, useEffect } from 'react';
import {
  Camera,
  MessageSquareText,
  CheckCircle2,
  Flame,
  Target,
  ArrowRight,
  Sparkles,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Layers,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../api/client.ts';
import type { SolvedQuestion, ProgressSummary } from '../types/index.ts';
import type { AppTab } from './Sidebar.tsx';

interface HomeViewProps {
  onNavigate: (tab: AppTab) => void;
  onOpenScan: () => void;
  onSelectQuestion: (question: SolvedQuestion) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenScan, onSelectQuestion }) => {
  const { user } = useAuth();
  const [recentQuestions, setRecentQuestions] = useState<SolvedQuestion[]>([]);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [qList, pData] = await Promise.all([
          api.getQuestions(),
          api.getProgressSummary(),
        ]);
        setRecentQuestions(qList.slice(0, 4));
        setProgress(pData);
      } catch (err) {
        console.warn('Dashboard data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const questionsSolvedToday = user?.questionsSolvedToday ?? 0;
  const dailyGoal = 5;
  const goalPercent = Math.min(100, Math.round((questionsSolvedToday / dailyGoal) * 100));

  return (
    <div className="content-wrapper">
      {/* Top Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(14, 165, 233, 0.08))',
          borderColor: 'var(--color-primary-border)',
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-6)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-primary">
              <Sparkles size={12} /> Questrix AI Assistant
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {user?.educationLevel || 'College'}
            </span>
          </div>

          <h1 style={{ fontSize: '1.75rem', marginBottom: '6px', fontWeight: 800 }}>
            {getGreeting()}, {user?.name || 'Scholar'}!
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '520px', marginBottom: 'var(--space-5)' }}>
            {user?.mainStudyGoal || 'Ready to understand your toughest subjects with step-by-step AI guidance?'}
          </p>

          {/* Quick Scan Hero Button */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <button
              className="btn btn-primary btn-lg pulsing-glow"
              onClick={onOpenScan}
              style={{ padding: '0.75rem 1.75rem', fontWeight: 700 }}
            >
              <Camera size={20} />
              <span>Quick Scan a Question</span>
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => onNavigate('tutor')}
            >
              <MessageSquareText size={19} />
              <span>Ask Questrix</span>
            </button>
          </div>
        </div>

        {/* Decorative Questrix 3D Holographic Emblem */}
        <div
          style={{
            position: 'absolute',
            right: '24px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '140px',
            height: '140px',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: '0 0 28px rgba(56, 189, 248, 0.4)',
            border: '1.5px solid rgba(56, 189, 248, 0.45)',
            background: '#070c18',
            pointerEvents: 'none',
          }}
          className="hero-emblem-badge"
        >
          <img
            src="/questrix-icon.png"
            alt="Questrix Holographic Emblem"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* Goal & Streak Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        {/* Today's Goal */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Today's Study Goal</span>
            <Target size={18} color="var(--color-primary)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800 }}>{questionsSolvedToday}</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ {dailyGoal} problems</span>
          </div>
          <div
            style={{
              height: '8px',
              width: '100%',
              background: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${goalPercent}%`,
                background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                borderRadius: 'var(--radius-full)',
                transition: 'width var(--transition-base)',
              }}
            />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            {goalPercent >= 100 ? '🎉 Daily goal achieved! Keep up the momentum.' : `${dailyGoal - questionsSolvedToday} more problems to hit your target.`}
          </p>
        </div>

        {/* Streak Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Study Streak</span>
            <Flame size={20} fill="var(--color-warning)" color="var(--color-warning)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-warning)' }}>
              {user?.streakDays ?? 1} Days
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Consistent</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            🔥 Solve at least one problem today to keep your streak alive!
          </p>
        </div>

        {/* Average Quiz Mastery */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Average Quiz Score</span>
            <CheckCircle2 size={18} color="var(--color-success)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-success)' }}>
              {progress && progress.quizzesCompleted > 0 ? `${progress.averageQuizScore}%` : '--'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {progress && progress.quizzesCompleted > 0 ? 'Accuracy' : 'No quizzes yet'}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {progress && progress.quizzesCompleted > 0
              ? `Based on ${progress.quizzesCompleted} completed quiz${progress.quizzesCompleted === 1 ? '' : 'zes'}`
              : 'Take your first quiz to calculate accuracy'}
          </p>
        </div>
      </div>

      {/* Dynamic Recommended Topic / Onboarding Card */}
      {(() => {
        const topRec = progress?.recommendations?.[0];
        if (topRec && progress && progress.quizzesCompleted > 0) {
          return (
            <div
              className="card card-interactive"
              style={{
                borderLeft: '4px solid var(--color-primary)',
                padding: 'var(--space-5)',
                marginBottom: 'var(--space-6)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-primary">Recommended for you</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{topRec.subject}</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>
                    {topRec.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '560px' }}>
                    {topRec.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => onNavigate('quizzes')}>
                    <span>Practice Quiz</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div
            className="card card-interactive"
            style={{
              borderLeft: '4px solid var(--color-accent)',
              padding: 'var(--space-5)',
              marginBottom: 'var(--space-6)',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(99, 102, 241, 0.04))',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-accent">Getting Started</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Personalized Learning</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>
                  Welcome to your Questrix Study Workspace
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '560px' }}>
                  Scan a difficult homework question, chat with the bilingual Socratic tutor, or generate a quiz to start building your mastery score!
                </p>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button className="btn btn-primary btn-sm" onClick={onOpenScan}>
                  <Camera size={14} />
                  <span>Scan First Problem</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Study Features Grid */}
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
        Study Toolkit
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <button
          className="card card-interactive"
          onClick={() => onNavigate('tutor')}
          style={{ textAlign: 'left', cursor: 'pointer', padding: 'var(--space-4)' }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
            }}
          >
            <MessageSquareText size={19} />
          </div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '2px' }}>AI Tutor</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bilingual academic tutoring in English & Urdu</p>
        </button>

        <button
          className="card card-interactive"
          onClick={() => onNavigate('quizzes')}
          style={{ textAlign: 'left', cursor: 'pointer', padding: 'var(--space-4)' }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-success-light)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
            }}
          >
            <CheckCircle2 size={19} />
          </div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '2px' }}>Quiz Generator</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Custom practice MCQs with instant explanations</p>
        </button>

        <button
          className="card card-interactive"
          onClick={() => onNavigate('notes')}
          style={{ textAlign: 'left', cursor: 'pointer', padding: 'var(--space-4)' }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--color-warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
            }}
          >
            <BookOpen size={19} />
          </div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '2px' }}>Notes & Summaries</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Upload text or PDFs for key revision points</p>
        </button>

        <button
          className="card card-interactive"
          onClick={() => onNavigate('flashcards')}
          style={{ textAlign: 'left', cursor: 'pointer', padding: 'var(--space-4)' }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(56, 189, 248, 0.15)',
              color: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
            }}
          >
            <Layers size={19} />
          </div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '2px' }}>Flashcards</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Interactive active recall with 3D flip decks</p>
        </button>

        <button
          className="card card-interactive"
          onClick={() => onNavigate('planner')}
          style={{ textAlign: 'left', cursor: 'pointer', padding: 'var(--space-4)' }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(168, 85, 247, 0.15)',
              color: '#a855f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
            }}
          >
            <Calendar size={19} />
          </div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '2px' }}>Exam Planner</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily study schedule and milestone tracker</p>
        </button>

        <button
          className="card card-interactive"
          onClick={() => onNavigate('progress')}
          style={{ textAlign: 'left', cursor: 'pointer', padding: 'var(--space-4)' }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
            }}
          >
            <TrendingUp size={19} />
          </div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '2px' }}>Progress</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Detailed analytics, strong & weak topics</p>
        </button>
      </div>

      {/* Recent Solved Questions Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recently Solved Questions</h3>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onNavigate('progress')}
          style={{ fontSize: '0.8rem' }}
        >
          View All <ChevronRight size={14} />
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div className="card skeleton" style={{ height: '70px' }} />
          <div className="card skeleton" style={{ height: '70px' }} />
        </div>
      ) : recentQuestions.length === 0 ? (
        /* Empty State */
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: 'var(--space-8) var(--space-4)',
            color: 'var(--text-muted)',
          }}
        >
          <Camera size={38} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            No questions solved yet
          </h4>
          <p style={{ fontSize: '0.85rem', marginBottom: 'var(--space-4)' }}>
            Scan a problem from your book or type a question to see step-by-step solutions!
          </p>
          <button className="btn btn-primary btn-sm" onClick={onOpenScan}>
            <Camera size={14} /> Scan First Question
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {recentQuestions.map((q) => (
            <div
              key={q.id}
              className="card card-interactive"
              onClick={() => onSelectQuestion(q)}
              style={{
                cursor: 'pointer',
                padding: 'var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                  }}
                >
                  {q.subject.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                      {q.subject}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{q.topic}</span>
                  </div>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {q.questionText}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', flexShrink: 0 }}>
                <span style={{ fontSize: '0.75rem' }}>Solution</span>
                <ChevronRight size={16} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
