import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Mail,
  User,
  GraduationCap,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import type { EducationLevel } from '../types/index.ts';

const GoogleGLogo: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const AuthGateView: React.FC = () => {
  const { loginWithGoogle, login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('College / A-Levels');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'quick' | 'details'>('quick');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleModalEmail, setGoogleModalEmail] = useState('');
  const [googleModalName, setGoogleModalName] = useState('');

  // Initialize Google Identity Services if client ID is configured
  useEffect(() => {
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    if (clientId && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if ((window as any).google?.accounts?.id) {
          (window as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: any) => {
              try {
                setLoading(true);
                setError(null);
                await loginWithGoogle({
                  email: '',
                  name: '',
                  credential: response.credential,
                  educationLevel,
                });
              } catch (err: any) {
                setError(err.message || 'Google Sign-In failed');
              } finally {
                setLoading(false);
              }
            },
          });
        }
      };
      document.head.appendChild(script);
      return () => {
        if (script.parentNode) script.parentNode.removeChild(script);
      };
    }
  }, [loginWithGoogle, educationLevel]);

  const handleGoogleClick = () => {
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    if (clientId && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification?.isNotDisplayed() || notification?.isSkippedMoment()) {
            setGoogleModalEmail(email.trim() || 'sultan@gmail.com');
            setGoogleModalName(name.trim() || 'Sultan');
            setIsGoogleModalOpen(true);
          }
        });
      } catch {
        setGoogleModalEmail(email.trim() || 'sultan@gmail.com');
        setGoogleModalName(name.trim() || 'Sultan');
        setIsGoogleModalOpen(true);
      }
    } else {
      // Open dedicated Google Account sign-in dialog
      setGoogleModalEmail(email.trim() || 'sultan@gmail.com');
      setGoogleModalName(name.trim() || 'Sultan');
      setIsGoogleModalOpen(true);
    }
  };

  const handleGoogleModalSubmit = async () => {
    if (!googleModalEmail.trim()) {
      setError('Please enter your Google/Gmail address.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle({
        email: googleModalEmail.trim().toLowerCase(),
        name: googleModalName.trim() || googleModalEmail.split('@')[0],
        picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(googleModalEmail)}`,
        educationLevel,
      });
      setIsGoogleModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter your Gmail address.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'details' && name.trim()) {
        await register({
          name: name.trim(),
          email: cleanEmail,
          educationLevel,
        });
      } else {
        await login(cleanEmail);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const quickGmailPresets = ['sultan@gmail.com', 'student@gmail.com', 'scholar@gmail.com'];

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(56, 189, 248, 0.15), transparent 70%), var(--bg-app)',
        padding: 'var(--space-4)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background decoration */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 35px rgba(56, 189, 248, 0.15)',
          background: 'var(--bg-card)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
          <div
            style={{
              width: 80,
              height: 80,
              margin: '0 auto var(--space-3)',
              borderRadius: '24px',
              border: '2px solid rgba(56, 189, 248, 0.5)',
              boxShadow: '0 0 30px rgba(56, 189, 248, 0.4), inset 0 0 20px rgba(56, 189, 248, 0.2)',
              background: '#070c18',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src="/solvo-icon.png"
              alt="Solvo 3D Emblem"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(56, 189, 248, 0.12)',
                color: 'var(--color-primary)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              Solvo • AI Buddy for Study
            </span>
          </div>

          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: '6px',
            }}
          >
            Sign in to Your Workspace
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Each student's notes, flashcards, quizzes, and problem-solving history are securely partitioned by your Gmail.
          </p>
        </div>

        {error && (
          <div
            className="badge badge-danger"
            style={{
              width: '100%',
              padding: '10px 14px',
              marginBottom: 'var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textAlign: 'left',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.82rem' }}>{error}</span>
          </div>
        )}

        {/* Google One-Click CTA */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={loading}
          className="btn"
          style={{
            width: '100%',
            height: '46px',
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            fontSize: '0.95rem',
            fontWeight: 700,
            marginBottom: 'var(--space-4)',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <GoogleGLogo />
          <span>{loading ? 'Authenticating...' : 'Continue with Google'}</span>
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: 'var(--space-4) 0',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span>or sign in with your gmail</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        {/* Gmail Form without browser reload hazards */}
        <div>
          <div className="input-group" style={{ marginBottom: 'var(--space-3)' }}>
            <label className="input-label" htmlFor="student-email" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} color="var(--color-primary)" />
              <span>Gmail / Student Email Address</span>
            </label>
            <input
              id="student-email"
              type="email"
              required
              className="input-field"
              placeholder="e.g. sultan@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleDirectSubmit();
                }
              }}
              style={{
                fontSize: '0.92rem',
                borderRadius: 'var(--radius-md)',
                borderColor: email ? 'var(--color-primary)' : undefined,
              }}
            />
          </div>

          {/* Quick presets for testing */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Quick fill:</span>
            {quickGmailPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setEmail(preset)}
                style={{
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  color: 'var(--color-primary)',
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                }}
              >
                {preset}
              </button>
            ))}
          </div>

          {mode === 'details' && (
            <>
              <div className="input-group" style={{ marginBottom: 'var(--space-3)' }}>
                <label className="input-label" htmlFor="student-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} color="var(--color-primary)" />
                  <span>Student Name (Optional)</span>
                </label>
                <input
                  id="student-name"
                  type="text"
                  className="input-field"
                  placeholder="e.g. Sultan Bhai"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleDirectSubmit();
                    }
                  }}
                  style={{ fontSize: '0.92rem' }}
                />
              </div>

              <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="input-label" htmlFor="student-level" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GraduationCap size={14} color="var(--color-primary)" />
                  <span>Education Level</span>
                </label>
                <select
                  id="student-level"
                  className="input-field"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value as EducationLevel)}
                  style={{ fontSize: '0.92rem' }}
                >
                  <option value="Middle School">Middle School (Grades 6-8)</option>
                  <option value="High School">High School / Matric / O-Levels</option>
                  <option value="College / A-Levels">College / Intermediate / A-Levels</option>
                  <option value="University / Undergraduate">University / Undergraduate</option>
                  <option value="Graduate / Professional">Graduate / Professional</option>
                </select>
              </div>
            </>
          )}

          {mode === 'quick' && (
            <div style={{ textAlign: 'right', marginBottom: 'var(--space-3)' }}>
              <button
                type="button"
                onClick={() => setMode('details')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                + Customize name & grade level
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleDirectSubmit}
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              height: '46px',
              fontSize: '0.95rem',
              fontWeight: 800,
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? (
              <span>Entering Workspace...</span>
            ) : (
              <>
                <span>Enter Solvo Workspace</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Key Features Pill List */}
        <div
          style={{
            marginTop: 'var(--space-5)',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--border-color)',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={13} color="var(--color-success)" />
            <span>Step-by-Step AI Solver</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={13} color="var(--color-success)" />
            <span>24/7 Socratic AI Tutor</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={13} color="var(--color-success)" />
            <span>Auto Flashcards & Quizzes</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={13} color="var(--color-primary)" />
            <span>Gmail Data Privacy</span>
          </div>
        </div>
      </div>

      {/* Dedicated Google Sign-in Modal */}
      {isGoogleModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-dialog" style={{ maxWidth: '420px', padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <GoogleGLogo />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Sign in with Google</h3>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setIsGoogleModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Enter your Google email address to sign into your private Solvo study workspace.
            </p>

            <div className="input-group" style={{ marginBottom: 'var(--space-3)' }}>
              <label className="input-label" htmlFor="google-email-input">Google Email</label>
              <input
                id="google-email-input"
                type="email"
                className="input-field"
                placeholder="you@gmail.com"
                value={googleModalEmail}
                onChange={(e) => setGoogleModalEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGoogleModalSubmit();
                }}
              />
            </div>

            <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="input-label" htmlFor="google-name-input">Student Name (Optional)</label>
              <input
                id="google-name-input"
                type="text"
                className="input-field"
                placeholder="e.g. Sultan"
                value={googleModalName}
                onChange={(e) => setGoogleModalName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGoogleModalSubmit();
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsGoogleModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGoogleModalSubmit}
                disabled={loading}
              >
                {loading ? 'Connecting...' : 'Sign In with Google'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
