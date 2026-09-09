import React from 'react';
import { Home, MessageSquareText, Camera, CheckCircle2, User } from 'lucide-react';
import type { AppTab } from './Sidebar.tsx';

interface BottomNavProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenScan: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, onOpenScan }) => {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Mobile navigation">
      <button
        className={`bottom-nav-btn ${currentTab === 'home' ? 'active' : ''}`}
        onClick={() => onSelectTab('home')}
      >
        <Home size={20} />
        <span>Home</span>
      </button>

      <button
        className={`bottom-nav-btn ${currentTab === 'tutor' ? 'active' : ''}`}
        onClick={() => onSelectTab('tutor')}
      >
        <MessageSquareText size={20} />
        <span>Tutor</span>
      </button>

      {/* Prominent Floating Scan Button */}
      <button
        className="bottom-nav-btn scan-highlight"
        onClick={onOpenScan}
        aria-label="Open Smart Scan"
      >
        <div className="scan-circle-btn pulsing-glow">
          <Camera size={24} />
        </div>
        <span style={{ color: 'var(--color-primary)', fontWeight: 700, marginTop: '2px' }}>Scan</span>
      </button>

      <button
        className={`bottom-nav-btn ${currentTab === 'quizzes' ? 'active' : ''}`}
        onClick={() => onSelectTab('quizzes')}
      >
        <CheckCircle2 size={20} />
        <span>Quizzes</span>
      </button>

      <button
        className={`bottom-nav-btn ${currentTab === 'profile' ? 'active' : ''}`}
        onClick={() => onSelectTab('profile')}
      >
        <User size={20} />
        <span>Profile</span>
      </button>
    </nav>
  );
};
