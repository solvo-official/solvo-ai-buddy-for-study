import React from 'react';
import {
  Home,
  MessageSquareText,
  Camera,
  CheckCircle2,
  FileText,
  Layers,
  CalendarCheck,
  TrendingUp,
  User,
  Crown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export type AppTab =
  | 'home'
  | 'tutor'
  | 'scan'
  | 'quizzes'
  | 'notes'
  | 'flashcards'
  | 'planner'
  | 'progress'
  | 'profile';

interface SidebarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenUpgrade: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onOpenUpgrade }) => {
  const { user } = useAuth();

  const navItems: Array<{ id: AppTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'home', label: 'Home', icon: <Home size={19} /> },
    { id: 'scan', label: 'Smart Scan', icon: <Camera size={19} />, badge: 'AI' },
    { id: 'tutor', label: 'AI Tutor', icon: <MessageSquareText size={19} /> },
    { id: 'quizzes', label: 'Quizzes', icon: <CheckCircle2 size={19} /> },
    { id: 'notes', label: 'Notes & PDFs', icon: <FileText size={19} /> },
    { id: 'flashcards', label: 'Flashcards', icon: <Layers size={19} /> },
    { id: 'planner', label: 'Exam Planner', icon: <CalendarCheck size={19} /> },
    { id: 'progress', label: 'Progress', icon: <TrendingUp size={19} /> },
    { id: 'profile', label: 'Profile', icon: <User size={19} /> },
  ];

  return (
    <aside className="desktop-sidebar" role="navigation">
      <div className="sidebar-logo-area">
        <div className="logo-icon-box">
          <Sparkles size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Solvo</h2>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Your AI Study Buddy</p>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        <ul className="nav-links-list">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <li key={item.id}>
                <button
                  className={`nav-item-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span
                      className="badge badge-primary"
                      style={{ fontSize: '0.65rem', padding: '1px 6px', fontWeight: 700 }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Pro Upgrade Box */}
      {user?.plan !== 'premium' ? (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(14, 165, 233, 0.08))',
            borderColor: 'var(--color-primary-border)',
            padding: 'var(--space-4)',
            marginTop: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Crown size={18} color="var(--color-warning)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Solvo Pro</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Unlimited AI scans, deep PDF analysis, and custom exam planners.
          </p>
          <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={onOpenUpgrade}>
            Upgrade Now
          </button>
        </div>
      ) : (
        <div
          className="card"
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            borderColor: 'var(--color-success-border)',
            padding: 'var(--space-3)',
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Crown size={16} color="var(--color-warning)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-success)' }}>
            Pro Scholar Active
          </span>
        </div>
      )}
    </aside>
  );
};
