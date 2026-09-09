import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  AlertCircle,
  Plus,
  BookOpen,
} from 'lucide-react';
import { api } from '../api/client.ts';
import type { StudyPlan } from '../types/index.ts';

export const PlannerView: React.FC = () => {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d.toISOString().split('T')[0];
  });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Mathematics', 'Physics']);
  const [knowledgeLevel, setKnowledgeLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [dailyHours, setDailyHours] = useState(2.5);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const list = await api.getStudyPlans();
      setPlans(list);
      if (list.length > 0 && !activePlan) {
        setActivePlan(list[0]);
      }
    } catch (err) {
      console.warn('Failed to load study plans:', err);
    }
  };

  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    if (!activePlan) return;
    try {
      const updated = await api.togglePlanTask(activePlan.id, taskId, !currentCompleted);
      setActivePlan(updated);
      setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim() || selectedSubjects.length === 0) return;

    setIsGenerating(true);
    try {
      const newPlan = await api.generateStudyPlan({
        examName: examName.trim(),
        examDate,
        subjects: selectedSubjects,
        knowledgeLevel,
        dailyHours,
      });

      setPlans((prev) => [newPlan, ...prev]);
      setActivePlan(newPlan);
      setShowModal(false);
      setExamName('');
    } catch (err: any) {
      alert('Failed to generate study plan: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSubject = (s: string) => {
    if (selectedSubjects.includes(s)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((x) => x !== s));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, s]);
    }
  };

  const allSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Urdu', 'Computer Science'];

  return (
    <div className="content-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary">
              <CalendarCheck size={12} /> AI Exam Schedule Engine
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Exam Study Planner</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Tell Solvo your exam date and subjects. We engineer a personalized, balanced daily study and revision roadmap.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          <span>New Study Plan</span>
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-4)', color: 'var(--text-muted)' }}>
          <CalendarCheck size={42} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            No study plan active
          </h3>
          <p style={{ fontSize: '0.875rem', marginBottom: 'var(--space-4)' }}>
            Set your upcoming exam targets to get an AI-generated daily preparation schedule.
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <Sparkles size={14} /> Create Exam Schedule
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
          {/* Active Plan Overview Card */}
          {activePlan && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="card" style={{ padding: 'var(--space-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span className="badge badge-primary" style={{ marginBottom: '4px' }}>Active Roadmap</span>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{activePlan.examName}</h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Exam Date: {activePlan.examDate}
                    </span>
                  </div>

                  <div
                    className="badge badge-warning"
                    style={{ fontSize: '0.9rem', padding: '6px 12px', fontWeight: 800 }}
                  >
                    <Clock size={14} /> {activePlan.daysRemaining} Days Left
                  </div>
                </div>

                {/* Progress Ring / Bar */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    <span>Plan Progress</span>
                    <span style={{ color: 'var(--color-primary)' }}>{activePlan.completionPercentage}%</span>
                  </div>
                  <div style={{ height: '8px', width: '100%', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${activePlan.completionPercentage}%`,
                        background: 'linear-gradient(90deg, var(--color-primary), var(--color-success))',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width var(--transition-base)',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                  {activePlan.subjects.map((sub) => (
                    <span key={sub} className="badge badge-secondary" style={{ fontSize: '0.72rem' }}>
                      {sub}
                    </span>
                  ))}
                  <span className="badge badge-secondary" style={{ fontSize: '0.72rem' }}>
                    {activePlan.dailyHours} hrs/day
                  </span>
                </div>
              </div>

              {/* Task Checklist */}
              <div className="card" style={{ padding: 'var(--space-5)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
                  Daily Action Plan
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {activePlan.tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id, task.completed)}
                      className="card card-interactive"
                      style={{
                        padding: 'var(--space-3) var(--space-4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: task.completed ? 'var(--bg-surface-subtle)' : 'var(--bg-surface)',
                        opacity: task.completed ? 0.75 : 1,
                      }}
                    >
                      <div style={{ color: task.completed ? 'var(--color-success)' : 'var(--text-muted)' }}>
                        {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                            {task.dayLabel}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {task.subject}
                          </span>
                          <span
                            className={`badge ${
                              task.type === 'quiz'
                                ? 'badge-warning'
                                : task.type === 'practice'
                                ? 'badge-success'
                                : 'badge-primary'
                            }`}
                            style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}
                          >
                            {task.type}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                          }}
                        >
                          {task.task}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Plan Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
              Create AI Exam Schedule
            </h3>

            <form onSubmit={handleCreatePlan}>
              <div className="input-group">
                <label className="input-label">Exam Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Midterm Board Exams 2026"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Target Exam Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Subjects to Cover</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {allSubjects.map((s) => {
                    const isSelected = selectedSubjects.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => toggleSubject(s)}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <label className="input-label">Knowledge Level</label>
                  <select
                    className="input-field"
                    value={knowledgeLevel}
                    onChange={(e) => setKnowledgeLevel(e.target.value as any)}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Daily Available Hours</label>
                  <select
                    className="input-field"
                    value={dailyHours}
                    onChange={(e) => setDailyHours(Number(e.target.value))}
                  >
                    <option value={1}>1 hour</option>
                    <option value={2}>2 hours</option>
                    <option value={2.5}>2.5 hours</option>
                    <option value={4}>4 hours</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isGenerating}>
                  <Sparkles size={16} />
                  <span>{isGenerating ? 'Building Schedule...' : 'Generate Plan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
