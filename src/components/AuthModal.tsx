import React, { useState, useEffect } from 'react';
import { LogIn, UserPlus, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Official Google G Logo SVG
const GoogleGLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, loginAsGuest, loginWithGoogle } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [isGoogleCustomModal, setIsGoogleCustomModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [educationLevel, setEducationLevel] = useState('College / A-Levels');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
                await loginWithGoogle({
                  email: '',
                  name: '',
                  credential: response.credential,
                });
                onClose();
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
  }, [loginWithGoogle, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    try {
      if (isRegister) {
        if (!name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        await register({ name, email, educationLevel });
      } else {
        await login(email);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    if (clientId && (window as any).google?.accounts?.id) {
      // Trigger Google One Tap / Sign In prompt
      (window as any).google.accounts.id.prompt();
    } else {
      // Open Google ID prompt dialog for instant sign-in / demo testing
      setIsGoogleCustomModal(true);
    }
  };

  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim()) {
      setError('Google email is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle({
        email: googleEmail.trim().toLowerCase(),
        name: googleName.trim() || googleEmail.split('@')[0],
        picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(googleEmail)}`,
        educationLevel,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoGoogle = async (demoName: string, demoEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle({
        email: demoEmail,
        name: demoName,
        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(demoName)}`,
        educationLevel: 'College / A-Levels',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google demo sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await loginAsGuest();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-dialog">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isGoogleCustomModal ? <GoogleGLogo /> : isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {isGoogleCustomModal ? 'Sign in with Google ID' : isRegister ? 'Create Solvo Account' : 'Sign in to Solvo'}
            </h3>
          </div>

          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '8px', marginBottom: 'var(--space-3)' }}>
            {error}
          </div>
        )}

        {isGoogleCustomModal ? (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Sign in securely with your Google account ID or academic Google Workspace email.
            </p>

            <form onSubmit={handleGoogleSubmit}>
              <div className="input-group">
                <label className="input-label">Google Account Email</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="student@gmail.com or @school.edu"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Sultan Bhai"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginBottom: 'var(--space-3)', display: 'flex', justifyContent: 'center', gap: '8px' }}
                disabled={loading}
              >
                <GoogleGLogo />
                <span>{loading ? 'Authenticating...' : 'Sign In with Google Account'}</span>
              </button>
            </form>

            <div style={{ margin: 'var(--space-4) 0', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Or test with a 1-click Google Profile:</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickDemoGoogle('Sultan (Student)', 'sultan.student@gmail.com')}
                disabled={loading}
              >
                🎓 Sultan (Google)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickDemoGoogle('Aisha (Scholar)', 'aisha.study@gmail.com')}
                disabled={loading}
              >
                📚 Aisha (Google)
              </button>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ width: '100%' }}
              onClick={() => setIsGoogleCustomModal(false)}
            >
              ← Back to standard sign in
            </button>
          </div>
        ) : (
          <div>
            {/* Primary Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleClick}
              className="btn btn-secondary btn-lg"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: 'var(--space-4)',
                fontWeight: 700,
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                boxShadow: 'var(--shadow-sm)',
              }}
              disabled={loading}
            >
              <GoogleGLogo />
              <span>Continue with Google</span>
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                textAlign: 'center',
                margin: 'var(--space-3) 0',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              <span style={{ padding: '0 12px' }}>or continue with email</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            </div>

            <form onSubmit={handleSubmit}>
              {isRegister && (
                <div className="input-group">
                  <label className="input-label">Student Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Sultan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="e.g. sultan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {isRegister && (
                <div className="input-group">
                  <label className="input-label">Education Level</label>
                  <select
                    className="input-field"
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                  >
                    <option value="Middle School">Middle School</option>
                    <option value="High School">High School (Matric / O-Levels)</option>
                    <option value="College / A-Levels">College (FSc / A-Levels)</option>
                    <option value="University">University / Undergraduate</option>
                    <option value="Competitive Exams">Competitive Exams</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginBottom: 'var(--space-3)' }}
                disabled={loading}
              >
                <span>{loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In with Email'}</span>
              </button>
            </form>

            <div style={{ textAlign: 'center', margin: 'var(--space-2) 0' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-2)', textAlign: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleGuest}
                disabled={loading}
              >
                <Sparkles size={14} /> Continue as Guest
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
