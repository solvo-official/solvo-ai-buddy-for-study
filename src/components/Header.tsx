import React from 'react';
import { Camera, Flame, Sun, Moon, Crown, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';

interface HeaderProps {
  onOpenUpgrade: () => void;
  onOpenProfile: () => void;
  onOpenScan: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenUpgrade, onOpenProfile, onOpenScan }) => {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isUrdu = user?.preferredLanguage === 'ur';

  const toggleLanguage = () => {
    const nextLang = isUrdu ? 'en' : 'ur';
    updateProfile({ preferredLanguage: nextLang });
  };

  return (
    <header className="top-header" role="banner">
      <div className="header-brand">
        <div
          className="logo-icon-box"
          style={{
            width: 36,
            height: 36,
            overflow: 'hidden',
            padding: 0,
            border: '1.5px solid rgba(56, 189, 248, 0.4)',
            boxShadow: '0 0 14px rgba(56, 189, 248, 0.35)',
            background: '#070c18',
          }}
        >
          <img
            src="/questrix-icon.png"
            alt="Questrix Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Questrix</span>
            {user?.plan === 'premium' ? (
              <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                <Crown size={10} /> PRO
              </span>
            ) : (
              <span
                className="badge badge-primary"
                onClick={onOpenUpgrade}
                style={{ fontSize: '0.65rem', padding: '1px 6px', cursor: 'pointer' }}
                title="Click to upgrade"
              >
                FREE
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Your AI Buddy for Study
          </span>
        </div>
      </div>

      <div className="header-actions">
        {/* Streak Badge */}
        <div
          className="badge"
          style={{
            background: 'rgba(245, 158, 11, 0.12)',
            color: 'var(--color-warning)',
            border: '1px solid var(--color-warning-border)',
            padding: '4px 10px',
            fontSize: '0.8rem',
            fontWeight: 700,
          }}
          title="Daily Study Streak"
        >
          <Flame size={14} fill="currentColor" />
          <span>{user?.streakDays || 1}d</span>
        </div>

        {/* Quick Scan CTA */}
        <button
          className="btn btn-primary btn-sm"
          onClick={onOpenScan}
          style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'flex', gap: '5px', alignItems: 'center', fontWeight: 700 }}
          title="Scan a Question"
        >
          <Camera size={13} />
          <span className="hide-mobile">Scan</span>
        </button>

        {/* Language Switcher */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={toggleLanguage}
          style={{ padding: '4px 8px', fontSize: '0.78rem', display: 'flex', gap: '4px', alignItems: 'center' }}
          title="Switch Language"
        >
          <Globe size={14} />
          <span>{isUrdu ? 'اردو' : 'EN'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{ width: 34, height: 34 }}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* User Avatar */}
        <button
          className="btn btn-secondary btn-icon"
          onClick={onOpenProfile}
          style={{ width: 34, height: 34, borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', padding: 0 }}
          title={user?.name || 'Open Profile'}
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : user?.name ? (
            user.name[0].toUpperCase()
          ) : (
            'S'
          )}
        </button>
      </div>
    </header>
  );
};
