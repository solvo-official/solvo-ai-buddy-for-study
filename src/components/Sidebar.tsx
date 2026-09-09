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
} from 'lucide-react';

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
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {

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
        <div
          className="logo-icon-box"
          style={{
            width: 40,
            height: 40,
            overflow: 'hidden',
            padding: 0,
            border: '1.5px solid rgba(56, 189, 248, 0.4)',
            boxShadow: '0 0 16px rgba(56, 189, 248, 0.35)',
            background: '#070c18',
          }}
        >
          <img
            src="/questrix-icon.png"
            alt="Questrix Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Questrix</h2>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Your AI Buddy for Study</p>
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
    </aside>
  );
};
