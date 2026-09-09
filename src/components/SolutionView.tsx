import React, { useState } from 'react';
import {
  Bookmark,
  Share2,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  Languages,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquareText,
  Lightbulb,
} from 'lucide-react';
import type { SolvedQuestion } from '../types/index.ts';
import { api } from '../api/client.ts';

interface SolutionViewProps {
  question: SolvedQuestion;
  onBack: () => void;
  onAskFollowUp: (q: SolvedQuestion) => void;
}

export const SolutionView: React.FC<SolutionViewProps> = ({ question, onBack, onAskFollowUp }) => {
  const [isSaved, setIsSaved] = useState(question.isSaved || false);
  const [showUrdu, setShowUrdu] = useState(false);
  const [showSimpler, setShowSimpler] = useState(false);
  const [showAlternative, setShowAlternative] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const [showPracticeHint, setShowPracticeHint] = useState(false);
  const [showPracticeAnswer, setShowPracticeAnswer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleSave = async () => {
    try {
      const saved = await api.toggleSaveQuestion(question.id);
      setIsSaved(saved);
      triggerToast(saved ? 'Question saved to bookmarks!' : 'Question removed from bookmarks');
    } catch {
      triggerToast('Could not update bookmark');
    }
  };

  const handleCopyAnswer = () => {
    navigator.clipboard.writeText(question.finalAnswer);
    setCopied(true);
    triggerToast('Final answer copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const textToShare = `Solvo Study Solution:\nQuestion: ${question.questionText}\nFinal Answer: ${question.finalAnswer}\nSolved with Solvo - Your AI Study Buddy`;
    if (navigator.share) {
      navigator.share({ title: 'Solvo Solution', text: textToShare });
    } else {
      navigator.clipboard.writeText(textToShare);
      triggerToast('Solution copied to clipboard!');
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="content-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            <CheckCircle2 size={16} color="var(--color-success)" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Back Button & Header Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-4)',
        }}
      >
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            className={`btn btn-sm ${isSaved ? 'btn-primary' : 'btn-secondary'}`}
            onClick={toggleSave}
            title={isSaved ? 'Remove Bookmark' : 'Save Question'}
          >
            <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleShare} title="Share Solution">
            <Share2 size={15} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Subject & Meta Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
        <span className="badge badge-primary">{question.subject}</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{question.topic}</span>
      </div>

      {/* Question Card */}
      <div className="card" style={{ marginBottom: 'var(--space-5)', padding: 'var(--space-5)' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Problem Statement
        </span>
        <h2 style={{ fontSize: '1.25rem', marginTop: '6px', fontWeight: 700, lineHeight: 1.4 }}>
          {question.questionText}
        </h2>

        {question.imageUrl && (
          <div style={{ marginTop: 'var(--space-4)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <img
              src={question.imageUrl}
              alt="Problem scan"
              style={{ maxWidth: '100%', maxHeight: '240px', objectFit: 'contain', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
        )}
      </div>

      {/* Step-by-Step Derivation Section */}
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Sparkles size={18} color="var(--color-primary)" />
        <span>Step-by-Step Solution</span>
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        {question.steps.map((step) => (
          <div
            key={step.stepNumber}
            className="card"
            style={{
              borderLeft: '4px solid var(--color-primary)',
              padding: 'var(--space-4) var(--space-5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                }}
              >
                {step.stepNumber}
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{step.title}</h4>
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
              {step.content}
            </p>

            {step.keyRuleOrFormula && (
              <div
                style={{
                  marginTop: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--bg-surface-subtle)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <strong>Rule / Formula:</strong> {step.keyRuleOrFormula}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Final Answer Highlight Box */}
      <div
        className="card"
        style={{
          background: 'var(--color-success-light)',
          borderColor: 'var(--color-success-border)',
          padding: 'var(--space-5)',
          marginBottom: 'var(--space-5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <CheckCircle2 size={18} color="var(--color-success)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-success)', textTransform: 'uppercase' }}>
              Final Answer
            </span>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-success-hover)', letterSpacing: '-0.01em' }}>
            {question.finalAnswer}
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={handleCopyAnswer}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy Answer'}</span>
        </button>
      </div>

      {/* Conceptual Explanation */}
      <div className="card" style={{ marginBottom: 'var(--space-5)', padding: 'var(--space-5)' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
          Why This Solution Works
        </h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {question.explanation}
        </p>
      </div>

      {/* Interactive Action Toolbar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-6)',
        }}
      >
        {/* Explain Simpler */}
        <button
          className={`btn ${showSimpler ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setShowSimpler(!showSimpler)}
        >
          <Lightbulb size={16} />
          <span>Explain Simpler</span>
          {showSimpler ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Explain in Urdu */}
        <button
          className={`btn ${showUrdu ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setShowUrdu(!showUrdu)}
        >
          <Languages size={16} />
          <span>اردو میں سمجھیں</span>
          {showUrdu ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Another Method */}
        {question.alternativeMethod && (
          <button
            className={`btn ${showAlternative ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowAlternative(!showAlternative)}
          >
            <Sparkles size={16} />
            <span>Another Method</span>
            {showAlternative ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}

        {/* Practice Similar */}
        {question.similarPracticeQuestion && (
          <button
            className={`btn ${showPractice ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowPractice(!showPractice)}
          >
            <HelpCircle size={16} />
            <span>Practice Similar</span>
            {showPractice ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}

        {/* Ask Solvo follow-up */}
        <button
          className="btn btn-secondary"
          onClick={() => onAskFollowUp(question)}
        >
          <MessageSquareText size={16} />
          <span>Ask Solvo Follow-up</span>
        </button>
      </div>

      {/* Accordion 1: Simpler Explanation */}
      {showSimpler && (
        <div
          className="card"
          style={{
            background: 'var(--color-primary-light)',
            borderColor: 'var(--color-primary-border)',
            padding: 'var(--space-5)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Lightbulb size={18} color="var(--color-primary)" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              Simplified Breakdown
            </h4>
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
            {question.simplerExplanation ||
              'Imagine this problem in the simplest terms: gather the known facts first, use the direct rule, and simplify without unnecessary algebra.'}
          </p>
        </div>
      )}

      {/* Accordion 2: Urdu Explanation */}
      {showUrdu && (
        <div
          className="card"
          style={{
            background: 'var(--bg-surface-subtle)',
            borderColor: 'var(--border-default)',
            padding: 'var(--space-5)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>اردو میں وضاحت</h4>
            <Languages size={18} color="var(--color-primary)" />
          </div>
          <p className="urdu-text" style={{ color: 'var(--text-primary)' }}>
            {question.urduExplanation || 'اس سوال کا تفصیلی اور جامع حل مرحلہ وار اوپر پیش کر دیا گیا ہے۔'}
          </p>
        </div>
      )}

      {/* Accordion 3: Alternative Method */}
      {showAlternative && question.alternativeMethod && (
        <div
          className="card"
          style={{
            borderColor: 'var(--color-accent)',
            padding: 'var(--space-5)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Sparkles size={18} color="var(--color-accent)" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>
              Alternative Method: {question.alternativeMethod.title}
            </h4>
          </div>
          <ol style={{ paddingLeft: '1.25rem', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {question.alternativeMethod.steps.map((s, idx) => (
              <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {s}
              </li>
            ))}
          </ol>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-accent)' }}>
            Result: {question.alternativeMethod.finalAnswer}
          </div>
        </div>
      )}

      {/* Accordion 4: Practice Similar Problem */}
      {showPractice && question.similarPracticeQuestion && (
        <div
          className="card"
          style={{
            borderColor: 'var(--color-warning-border)',
            background: 'var(--color-warning-light)',
            padding: 'var(--space-5)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <HelpCircle size={18} color="var(--color-warning)" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#92400e' }}>
              Practice a Similar Question
            </h4>
          </div>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
            {question.similarPracticeQuestion.question}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: '12px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowPracticeHint(!showPracticeHint)}
            >
              <Lightbulb size={14} />
              <span>{showPracticeHint ? 'Hide Hint' : 'Show Hint'}</span>
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowPracticeAnswer(!showPracticeAnswer)}
            >
              <CheckCircle2 size={14} />
              <span>{showPracticeAnswer ? 'Hide Solution' : 'Reveal Solution'}</span>
            </button>
          </div>

          {showPracticeHint && (
            <p style={{ fontSize: '0.85rem', color: '#92400e', marginBottom: '8px', background: 'rgba(255,255,255,0.7)', padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}>
              <strong>Hint:</strong> {question.similarPracticeQuestion.hint}
            </p>
          )}

          {showPracticeAnswer && (
            <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.9)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 700, color: 'var(--color-success)', marginBottom: '4px' }}>
                Answer: {question.similarPracticeQuestion.answer}
              </div>
              <div>{question.similarPracticeQuestion.explanation}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
