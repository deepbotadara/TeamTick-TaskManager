'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { useAuth } from '@/app/contexts/AuthContext';

interface UserOption {
  userId: number;
  username: string;
  email: string;
}

export default function TaskCreate() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const listId = params.listId as string;
  const { user: authUser } = useAuth();
  const isAdmin = authUser?.role === 'Admin';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('');
  const [users, setUsers] = useState<UserOption[]>([]);
  const [projectName, setProjectName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const headers = { 'Authorization': `Bearer ${token}` };

    const projectRes = await fetch(`/api/projects/${projectId}`, { headers });
    if (projectRes.ok) {
      const projectData = await projectRes.json();
      setProjectName(projectData.ProjectName || '');
    }

    // Only admin can assign tasks to other users
    if (isAdmin) {
      const usersRes = await fetch('/api/users', { headers });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.data || []);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/lists/${listId}/tasks`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          priority,
          status: 'Pending',
          dueDate: dueDate || null,
          assignedTo: assignee ? parseInt(assignee) : null
        })
      });

      if (res.ok) {
        router.push(`/projects/${projectId}/lists/${listId}/kanban`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create task');
      }
    } catch {
      setError('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="task-create-page">
      <style jsx>{`
        .task-create-page { animation: fadeIn 0.5s ease-out; max-width: 700px; margin: 0 auto; }
        .breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--foreground-secondary); margin-bottom: 1.5rem; }
        .breadcrumb a { color: var(--primary-500); text-decoration: none; }
        .form-card { background: var(--background-secondary); border-radius: 20px; border: 1px solid var(--border-color); overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); }
        .form-header { padding: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .form-header h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem; }
        .form-header p { opacity: 0.9; font-size: 0.9375rem; }
        .form-body { padding: 2rem; }
        .form-group { margin-bottom: 1.5rem; }
        .form-label { display: block; font-size: 0.875rem; font-weight: 600; color: var(--foreground); margin-bottom: 0.5rem; }
        .form-label span { color: var(--danger-500); }
        .form-input { width: 100%; padding: 0.875rem 1rem; font-size: 1rem; background: var(--gray-50); border: 2px solid var(--border-color); border-radius: 12px; color: var(--foreground); transition: all 0.2s; }
        .form-input:focus { outline: none; border-color: var(--primary-500); background: var(--background-secondary); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
        .form-textarea { min-height: 140px; resize: vertical; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 640px) { .form-row { grid-template-columns: 1fr; } }
        .priority-options { display: flex; gap: 0.75rem; }
        .priority-option { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.875rem; background: var(--gray-50); border: 2px solid var(--border-color); border-radius: 12px; cursor: pointer; transition: all 0.2s; font-weight: 600; font-size: 0.875rem; }
        .priority-option:hover { border-color: var(--gray-300); }
        .priority-option.selected { border-color: var(--primary-500); background: var(--primary-50); color: var(--primary-700); }
        .priority-option.high.selected { border-color: var(--danger-500); background: var(--danger-50); color: var(--danger-600); }
        .priority-option.medium.selected { border-color: var(--warning-500); background: var(--warning-50); color: var(--warning-600); }
        .priority-option.low.selected { border-color: var(--success-500); background: var(--success-50); color: var(--success-600); }
        .priority-dot { width: 10px; height: 10px; border-radius: 50%; }
        .priority-dot.high { background: var(--danger-500); }
        .priority-dot.medium { background: var(--warning-500); }
        .priority-dot.low { background: var(--success-500); }
        .form-select { width: 100%; padding: 0.875rem 2.5rem 0.875rem 1rem; font-size: 1rem; background: var(--gray-50); border: 2px solid var(--border-color); border-radius: 12px; color: var(--foreground); cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.75rem center; background-size: 1.25rem; transition: all 0.2s; }
        .form-select:focus { outline: none; border-color: var(--primary-500); background-color: var(--background-secondary); }
        .form-actions { display: flex; gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); }
        .btn { flex: 1; padding: 1rem; font-size: 1rem; font-weight: 600; border-radius: 12px; cursor: pointer; transition: all 0.2s; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .btn-secondary { background: var(--background-secondary); color: var(--foreground); border: 2px solid var(--border-color); }
        .btn-secondary:hover { border-color: var(--primary-500); color: var(--primary-500); }
        .error-msg { background: var(--danger-50); color: var(--danger-600); padding: 0.75rem 1rem; border-radius: 10px; margin-bottom: 1rem; font-size: 0.875rem; font-weight: 500; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <nav className="breadcrumb">
        <Link href="/projects">Projects</Link>
        <span>/</span>
        <Link href={`/projects/${projectId}`}>{projectName || 'Project'}</Link>
        <span>/</span>
        <span>Create Task</span>
      </nav>

      <div className="form-card">
        <div className="form-header">
          <h1>Create New Task</h1>
          <p>Add a new task to your project</p>
        </div>

        <form className="form-body" onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}

          <div className="form-group">
            <label className="form-label">Task Title <span>*</span></label>
            <input type="text" className="form-input" placeholder="Enter task title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input form-textarea" placeholder="Describe the task in detail..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <div className="priority-options">
              {['High', 'Medium', 'Low'].map(p => (
                <div key={p} className={`priority-option ${p.toLowerCase()} ${priority === p ? 'selected' : ''}`} onClick={() => setPriority(p)}>
                  <span className={`priority-dot ${p.toLowerCase()}`}></span>
                  {p}
                </div>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" className="form-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            {isAdmin && (
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select className="form-select" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                  <option value="">Select assignee...</option>
                  {users.map(u => (
                    <option key={u.userId} value={u.userId}>{u.username}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-actions">
            <Link href={`/projects/${projectId}/lists/${listId}/kanban`} className="btn btn-secondary">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <span>+</span> {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
