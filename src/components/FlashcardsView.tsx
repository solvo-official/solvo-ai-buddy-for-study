import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { api } from '../api/client.ts';
import type { Flashcard } from '../types/index.ts';

export const FlashcardsView: React.FC = () => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [topicInput, setTopicInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('Physics');

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      const list = await api.getFlashcards();
      setCards(list);
    } catch (err) {
      console.warn('Could not load flashcards:', err);
    }
  };

  const handleReview = async (rating: 'easy' | 'hard' | 'again') => {
    if (cards.length === 0) return;
    const current = cards[currentIndex];
    try {
      const updated = await api.reviewFlashcard(current.id, rating);
      setCards((prev) => prev.map((c) => (c.id === current.id ? updated : c)));
      setIsFlipped(false);
      // Advance to next card
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('Review failed:', err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;

    setIsGenerating(true);
    try {
      const newCards = await api.generateFlashcards({
        sourceText: topicInput.trim(),
        subject: subjectInput,
        topic: topicInput.trim(),
        count: 4,
      });

      setCards((prev) => [...newCards, ...prev]);
      setCurrentIndex(0);
      setIsFlipped(false);
      setShowCreateModal(false);
      setTopicInput('');
    } catch (err: any) {
      alert('Failed to generate cards: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    await api.deleteFlashcard(id);
    setCards((prev) => prev.filter((c) => c.id !== id));
    if (currentIndex >= cards.length - 1) {
      setCurrentIndex(Math.max(0, cards.length - 2));
    }
    setIsFlipped(false);
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="content-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary">
              <Layers size={12} /> Active Recall & Spaced Repetition
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Study Flashcards</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Flip cards to test memory retention. Rate difficulty to reinforce challenging concepts.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} />
          <span>New AI Deck</span>
        </button>
      </div>

      {cards.length === 0 ? (
        /* Empty State */
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-4)', color: 'var(--text-muted)' }}>
          <Layers size={42} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            No flashcards yet
          </h3>
          <p style={{ fontSize: '0.875rem', marginBottom: 'var(--space-4)' }}>
            Generate active-recall flashcards from any topic, formula, or chapter notes!
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            <Sparkles size={14} /> Generate First Deck
          </button>
        </div>
      ) : (
        <div>
          {/* Deck Progress Tracker */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Card {currentIndex + 1} of {cards.length}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="badge badge-primary">{currentCard?.subject}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{currentCard?.topic}</span>
            </div>
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="card"
            style={{
              minHeight: '280px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              padding: 'var(--space-8) var(--space-6)',
              marginBottom: 'var(--space-4)',
              background: isFlipped
                ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(16, 185, 129, 0.08))'
                : 'var(--bg-surface)',
              border: `2px solid ${isFlipped ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
              boxShadow: 'var(--shadow-md)',
              position: 'relative',
              userSelect: 'none',
              transition: 'all 200ms ease',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: 14,
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                letterSpacing: '0.05em',
              }}
            >
              {isFlipped ? 'Answer / Solution' : 'Question / Prompt'}
            </div>

            <button
              className="btn btn-ghost btn-icon"
              style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28 }}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(currentCard.id);
              }}
              title="Delete card"
            >
              <Trash2 size={14} color="var(--text-muted)" />
            </button>

            <div style={{ maxWidth: '600px' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.5, color: 'var(--text-primary)' }}>
                {isFlipped ? currentCard?.back : currentCard?.front}
              </p>
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              <RotateCw size={12} />
              <span>Tap card to flip</span>
            </div>
          </div>

          {/* Active Recall Difficulty Controls */}
          {isFlipped && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-5)',
              }}
            >
              <button
                className="btn btn-danger"
                onClick={() => handleReview('again')}
                style={{ flex: 1, maxWidth: '140px' }}
              >
                Review Again
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => handleReview('hard')}
                style={{ flex: 1, maxWidth: '140px', color: 'var(--color-warning)' }}
              >
                Hard
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleReview('easy')}
                style={{ flex: 1, maxWidth: '140px', background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
              >
                Easy
              </button>
            </div>
          )}

          {/* Navigation Arrows */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              className="btn btn-secondary"
              disabled={currentIndex === 0}
              onClick={() => {
                setCurrentIndex((prev) => prev - 1);
                setIsFlipped(false);
              }}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <button
              className="btn btn-secondary"
              disabled={currentIndex === cards.length - 1}
              onClick={() => {
                setCurrentIndex((prev) => prev + 1);
                setIsFlipped(false);
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal: Generate New AI Deck */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
              Generate AI Flashcard Deck
            </h3>

            <form onSubmit={handleGenerate}>
              <div className="input-group">
                <label className="input-label">Subject</label>
                <select
                  className="input-field"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                >
                  {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Urdu'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Topic or Concepts to Learn</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Newton's Laws of Motion, Organic Functional Groups..."
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!topicInput.trim() || isGenerating}
                >
                  <Sparkles size={16} />
                  <span>{isGenerating ? 'Generating Deck...' : 'Generate Deck'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
