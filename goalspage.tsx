import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import type { Goal } from '../types';

const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    targetAmount: string;
    currentAmount: string;
    deadline: string;
  }>({
    title: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
  });

  const fetchGoals = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/goals', { credentials: 'include', signal });
      if (!res.ok) throw new Error('Failed to load goals');
      const data: Goal[] = await res.json();
      setGoals(data);
    } catch (err) {
      if ((err as any).name !== 'AbortError') {
        setError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchGoals(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchGoals]);

  const openForm = (goal?: Goal) => {
    setError('');
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        title: goal.title,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        deadline: goal.deadline.slice(0, 10),
      });
    } else {
      setEditingGoal(null);
      setFormData({ title: '', targetAmount: '', currentAmount: '', deadline: '' });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingGoal(null);
    setFormData({ title: '', targetAmount: '', currentAmount: '', deadline: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = {
      title: formData.title,
      targetAmount: Number(formData.targetAmount),
      currentAmount: Number(formData.currentAmount),
      deadline: formData.deadline,
    };
    try {
      const url = editingGoal ? `/api/goals/${editingGoal.id}` : '/api/goals';
      const method = editingGoal ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save goal');
      await fetchGoals();
      closeForm();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this goal?')) return;
    setError('');
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete goal');
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const toggleComplete = async (goal: Goal) => {
    setError('');
    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !goal.completed }),
      });
      if (!res.ok) throw new Error('Failed to update goal');
      setGoals(prev =>
        prev.map(g => (g.id === goal.id ? { ...g, completed: !g.completed } : g))
      );
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="goals-page">
      <header className="goals-header">
        <h1>My Goals</h1>
        <button className="btn-primary" onClick={() => openForm()}>
          + New Goal
        </button>
      </header>
      {error && <div className="error">{error}</div>}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <ul className="goals-list">
          {goals.map(goal => {
            const progress = Math.min(
              100,
              Math.round((goal.currentAmount / goal.targetAmount) * 100)
            );
            return (
              <li key={goal.id} className={`goal-item ${goal.completed ? 'completed' : ''}`}>
                <div className="goal-info">
                  <h2>{goal.title}</h2>
                  <div className="progress-bar">
                    <progress value={progress} max={100} />
                    <span>{progress}%</span>
                  </div>
                  <p>
                    {goal.currentAmount} / {goal.targetAmount}
                  </p>
                  <p>Due: {new Date(goal.deadline).toLocaleDateString()}</p>
                </div>
                <div className="goal-actions">
                  <button onClick={() => toggleComplete(goal)}>
                    {goal.completed ? 'Mark Incomplete' : 'Mark Complete'}
                  </button>
                  <button onClick={() => openForm(goal)}>Edit</button>
                  <button onClick={() => handleDelete(goal.id)}>Delete</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingGoal ? 'Edit Goal' : 'New Goal'}</h2>
            <form onSubmit={handleSubmit} className="goal-form">
              <label>
                Title
                <input
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Target Amount
                <input
                  name="targetAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Current Amount
                <input
                  name="currentAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.currentAmount}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Deadline
                <input
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                />
              </label>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Save
                </button>
                <button type="button" onClick={closeForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsPage;