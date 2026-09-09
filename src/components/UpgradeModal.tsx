import React, { useState } from 'react';
import { Crown, Check, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext.tsx';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const { user, upgradeToPremium } = useAuth();
  const [upgrading, setUpgrading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      await upgradeToPremium();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        setUpgrading(false);
        onClose();
      }, 900);
    } catch {
      setUpgrading(false);
    }
  };

  const features = [
    { name: 'Smart AI Question Scans', free: '10 scans/day', pro: 'Unlimited Scans' },
    { name: 'AI Tutor Questions & Chat', free: '25 messages/day', pro: 'Unlimited Context' },
    { name: 'Practice Quizzes', free: 'Up to 5 questions', pro: 'Up to 20 questions' },
    { name: 'Notes & PDF Deep Summaries', free: 'Basic text', pro: 'Multipage PDFs + OCR' },
    { name: 'Personalized AI Exam Planner', free: '1 Schedule', pro: 'Unlimited Schedules' },
    { name: 'Advanced Diagnostics & Weak Topics', free: 'Basic summary', pro: 'Full In-depth Analytics' },
  ];

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="upgrade-modal-title">
      <div className="modal-dialog">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Crown size={22} color="var(--color-warning)" />
            <h3 id="upgrade-modal-title" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              Upgrade to Solvo Pro
            </h3>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-5)' }}>
          Supercharge your study sessions with unlimited scans, full PDF document processing, and adaptive exam plans.
        </p>

        {/* Feature Comparison Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
          {features.map((f, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: idx % 2 === 0 ? 'var(--bg-surface-subtle)' : 'transparent',
                fontSize: '0.875rem',
              }}
            >
              <span style={{ fontWeight: 600 }}>{f.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{f.free}</span>
                <span className="badge badge-success" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                  <Check size={12} /> {f.pro}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing & CTA */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(245, 158, 11, 0.1))',
            borderColor: 'var(--color-primary-border)',
            padding: 'var(--space-4)',
            textAlign: 'center',
            marginBottom: 'var(--space-4)',
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)' }}>
            All-Access Student Pass
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, margin: '4px 0' }}>
            $4.99 <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ month</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Instant student access • Cancel anytime
          </span>
        </div>

        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%', fontWeight: 700 }}
          onClick={handleUpgrade}
          disabled={upgrading || user?.plan === 'premium'}
        >
          <Sparkles size={18} />
          <span>
            {user?.plan === 'premium'
              ? 'You are already on Solvo Pro!'
              : upgrading
              ? 'Activating Pro Scholar...'
              : 'Upgrade to Solvo Pro Now'}
          </span>
        </button>
      </div>
    </div>
  );
};
