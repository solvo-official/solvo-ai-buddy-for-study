import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  BookOpen,
  Trash2,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../api/client.ts';
import type { StudyNote } from '../types/index.ts';

interface NotesViewProps {
  onGenerateFlashcards: (sourceText: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({ onGenerateFlashcards }) => {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [activeNote, setActiveNote] = useState<StudyNote | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Biology');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    try {
      const list = await api.getNotes();
      setNotes(list);
      setActiveNote((curr) => curr || (list.length > 0 ? list[0] : null));
    } catch (err) {
      console.warn('Could not load notes:', err);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !file) {
      setError('Please provide note text or upload a file.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const newNote = await api.summarizeNotes({
        title: title.trim() || undefined,
        subject,
        content: content.trim() || undefined,
        file: file || undefined,
      });

      setNotes((prev) => [newNote, ...prev]);
      setActiveNote(newNote);
      setTitle('');
      setContent('');
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to process document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this study note?')) {
      await api.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (activeNote?.id === id) {
        setActiveNote(notes.find((n) => n.id !== id) || null);
      }
    }
  };

  return (
    <div className="content-wrapper">
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="badge badge-primary">
            <FileText size={12} /> AI Document Summarizer
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Notes & Document Summaries</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Upload syllabus chapters, lecture transcripts, or notes. Solvo extracts high-yield definitions, bullet summaries, and revision sheets.
        </p>
      </div>

      {error && (
        <div className="badge badge-danger" style={{ width: '100%', padding: '10px', marginBottom: 'var(--space-4)' }}>
          {error}
        </div>
      )}

      {/* Input Card */}
      <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
          Upload & Summarize Material
        </h3>

        <form onSubmit={handleSummarize}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="note-title">Title / Chapter Name</label>
              <input
                id="note-title"
                type="text"
                className="input-field"
                placeholder="e.g. Chapter 4: Photosynthesis & Light Reactions"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="note-subject">Subject</label>
              <select
                id="note-subject"
                className="input-field"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Urdu', 'Computer Science'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="note-content">Paste Notes Text or Syllabus Material</label>
            <textarea
              id="note-content"
              className="input-field"
              rows={4}
              placeholder="Paste any textbook excerpt, lecture notes, or study paragraphs here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div>
              <label
                className="btn btn-secondary btn-sm"
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Upload size={14} />
                <span>{file ? file.name : 'Upload PDF / Text File'}</span>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  style={{ display: 'none' }}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <button type="submit" className="btn btn-primary" disabled={isProcessing}>
              <Sparkles size={16} />
              <span>{isProcessing ? 'Summarizing with AI...' : 'Generate AI Summary'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Two Column Layout: Notes List & Active Note Detail */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
        {/* Left Column: Note List */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
            Saved Study Notes ({notes.length})
          </h3>

          {notes.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}>
              <BookOpen size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ fontSize: '0.85rem' }}>No study notes saved yet. Upload or paste text above!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {notes.map((n) => (
                <div
                  key={n.id}
                  className="card card-interactive"
                  onClick={() => setActiveNote(n)}
                  style={{
                    padding: 'var(--space-4)',
                    cursor: 'pointer',
                    borderColor: activeNote?.id === n.id ? 'var(--color-primary)' : 'var(--border-subtle)',
                    background: activeNote?.id === n.id ? 'var(--color-primary-light)' : 'var(--bg-surface)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                      {n.subject}
                    </span>
                    <button
                      className="btn btn-ghost btn-icon"
                      style={{ width: 24, height: 24 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(n.id);
                      }}
                      title="Delete note"
                    >
                      <Trash2 size={13} color="var(--color-danger)" />
                    </button>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{n.title}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {n.summary}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Note Content Viewer */}
        {activeNote && (
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '4px' }}>{activeNote.subject}</span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{activeNote.title}</h2>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onGenerateFlashcards(activeNote.summary)}
                title="Convert note into flashcard deck"
              >
                <Layers size={14} />
                <span>Create Flashcards</span>
              </button>
            </div>

            {/* Summary */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>
                Executive Summary
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {activeNote.summary}
              </p>
            </div>

            {/* Key Points */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>
                Key Takeaways
              </h4>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {activeNote.keyPoints?.map((pt, idx) => (
                  <li key={idx} style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>

            {/* Definitions */}
            {activeNote.definitions?.length > 0 && (
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>
                  Definitions & Terms
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {activeNote.definitions.map((def, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--bg-surface-subtle)',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                      }}
                    >
                      <strong style={{ color: 'var(--color-primary)' }}>{def.term}: </strong>
                      <span>{def.definition}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revision Notes */}
            {activeNote.revisionNotes?.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>
                  Exam Revision Checklist
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {activeNote.revisionNotes.map((rev, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <CheckCircle2 size={14} color="var(--color-success)" />
                      <span>{rev}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
