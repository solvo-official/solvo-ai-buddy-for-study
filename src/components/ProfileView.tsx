import React, { useState } from 'react';
import {
  User,
  Crown,
  BookOpen,
  Globe,
  Target,
  LogOut,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import type { EducationLevel, Language } from '../types/index.ts';

interface ProfileViewProps {
  onOpenUpgrade: () => void;
  onOpenAuth: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenUpgrade, onOpenAuth }) => {
  const { user, updateProfile, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>(
    user?.educationLevel || 'College / A-Levels'
  );
  const [preferredLanguage, setPreferredLanguage] = useState<Language>(
    user?.preferredLanguage || 'en'
  );
  const [mainStudyGoal, setMainStudyGoal] = useState(user?.mainStudyGoal || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: name.trim(),
      educationLevel,
      preferredLanguage,
      mainStudyGoal: mainStudyGoal.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const isPremium = user?.plan === 'premium';

  return (
    <div className="content-wrapper">
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="badge badge-primary">
            <User size={12} /> Student Account
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Profile & Settings</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Personalize your learning level, primary exam goal, and preferred explanation language.
        </p>
      </div>

      {savedSuccess && (
        <div className="badge badge-success" style={{ width: '100%', padding: '10px 14px', marginBottom: 'var(--space-4)' }}>
          <CheckCircle2 size={16} /> Profile settings saved successfully!
        </div>
      )}

      {/* Plan Card */}
      <div
        className="card"
        style={{
          padding: 'var(--space-5)',
          marginBottom: 'var(--space-6)',
          background: isPremium
            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(79, 70, 229, 0.08))'
            : 'var(--bg-surface)',
          borderColor: isPremium ? 'var(--color-warning-border)' : 'var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Crown size={18} color="var(--color-warning)" />
              <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                {isPremium ? 'Solvo Pro Scholar' : 'Solvo Free Plan'}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {isPremium
                ? 'Unlimited question scans, deep PDF document summarization, and priority AI processing.'
                : '10 scans/day, standard AI tutor responses. Upgrade for unlimited scans and advanced exam plans.'}
            </p>
          </div>

          {!isPremium ? (
            <button className="btn btn-primary btn-sm" onClick={onOpenUpgrade}>
              <Crown size={14} /> Upgrade to Pro
            </button>
          ) : (
            <span className="badge badge-success" style={{ padding: '6px 12px', fontWeight: 700 }}>
              Active Subscription
            </span>
          )}
        </div>
      </div>

      {/* Form Settings */}
      <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
          Personal Learning Profile
        </h3>

        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label" htmlFor="student-name">Your Name</label>
            <input
              id="student-name"
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="student-level">Education Level</label>
            <select
              id="student-level"
              className="input-field"
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value as EducationLevel)}
            >
              <option value="Middle School">Middle School</option>
              <option value="High School">High School (Matric / O-Levels)</option>
              <option value="College / A-Levels">College (FSc / A-Levels)</option>
              <option value="University">University / Undergraduate</option>
              <option value="Competitive Exams">Competitive Exams (MCAT, ECAT, SAT)</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="student-lang">Preferred Explanation Language</label>
            <select
              id="student-lang"
              className="input-field"
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value as Language)}
            >
              <option value="en">English</option>
              <option value="ur">اردو (Urdu)</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="student-goal">Main Study Goal</label>
            <input
              id="student-goal"
              type="text"
              className="input-field"
              placeholder="e.g. Score 90%+ in Board Exams, Master Organic Chemistry..."
              value={mainStudyGoal}
              onChange={(e) => setMainStudyGoal(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <button type="submit" className="btn btn-primary">
              <Save size={15} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Account Switcher */}
      <div className="card" style={{ padding: 'var(--space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Account Access</h4>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Signed in as: {user?.email || 'guest@solvo.study'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-secondary btn-sm" onClick={onOpenAuth}>
            Switch Account
          </button>
          <button className="btn btn-ghost btn-sm" onClick={logout} style={{ color: 'var(--color-danger)' }}>
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
