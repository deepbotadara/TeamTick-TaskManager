'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface Task {
  taskId: number;
  title: string;
  description?: string;
  projectName: string;
  status: string;
  priority: string;
  dueDate: string;
}

export default function MyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchTasks();
  }, [statusFilter, priorityFilter, authLoading]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      
      const response = await fetch(`/api/tasks/my-tasks?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }      if (response.ok) {
        const json = await response.json();
        // API returns { success, data: [...tasks...] }
        const tasksArr = json.data || json.tasks || json;
        // Map API fields to our interface
        const mapped = (Array.isArray(tasksArr) ? tasksArr : []).map((t: any) => ({
          taskId: t.taskId || t.TaskID,
          title: t.title || t.Title,
          description: t.description || t.Description,
          projectName: t.project?.projectName || t.projectName || '',
          status: t.status || t.Status,
          priority: t.priority || t.Priority,
          dueDate: t.dueDate || t.DueDate,
        }));
        setTasks(mapped);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (taskId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed' })
      });
      if (res.ok) fetchTasks();
      else alert('Failed to mark task as complete');
    } catch { alert('Failed to mark task as complete'); }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed': return { bg: 'var(--success-100)', color: 'var(--success-600)' };
      case 'In Progress': return { bg: 'var(--primary-100)', color: 'var(--primary-700)' };
      default: return { bg: 'var(--warning-100)', color: 'var(--warning-600)' };
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'High': return { bg: 'var(--danger-100)', color: 'var(--danger-600)' };
      case 'Medium': return { bg: 'var(--warning-100)', color: 'var(--warning-600)' };
      default: return { bg: 'var(--success-100)', color: 'var(--success-600)' };
    }
  };

  return (
    <div className="my-tasks-page">
      <style jsx>{`
        .my-tasks-page {
          animation: fadeIn 0.5s ease-out;
        }
        .page-header {
          margin-bottom: 2rem;
          animation: fadeInUp 0.5s ease-out;
        }
        .page-header h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--foreground);
          margin-bottom: 0.5rem;
        }
        .page-header p {
          color: var(--foreground-secondary);
          font-size: 0.9375rem;
        }
        .filter-section {
          background: var(--background-secondary);
          border-radius: 16px;
          border: 1px solid var(--border-color);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          animation: fadeInUp 0.5s ease-out 0.1s backwards;
        }
        .filter-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .filter-group {
          flex: 1;
          min-width: 200px;
        }
        .filter-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--foreground-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
          display: block;
        }
        .filter-select, .date-input {
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 0.9375rem;
          background: var(--background);
          border: 2px solid var(--border-color);
          border-radius: 10px;
          color: var(--foreground);
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-select:focus, .date-input:focus {
          outline: none;
          border-color: var(--primary-500);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        .quick-filters {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }
        .quick-filter-chip {
          padding: 0.625rem 1.25rem;
          background: var(--background);
          border: 2px solid var(--border-color);
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--foreground);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .quick-filter-chip:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-color: var(--primary-300);
        }
        .quick-filter-chip.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
        }
        .tasks-container {
          animation: fadeInUp 0.5s ease-out 0.15s backwards;
        }
        .tasks-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .tasks-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--foreground);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .task-count {
          font-size: 0.875rem;
          color: var(--foreground-secondary);
        }
        .task-card {
          background: var(--background-secondary);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 1.25rem;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
          animation: fadeInUp 0.4s ease-out backwards;
        }
        .task-card:nth-child(1) { animation-delay: 0.2s; }
        .task-card:nth-child(2) { animation-delay: 0.25s; }
        .task-card:nth-child(3) { animation-delay: 0.3s; }
        .task-card:nth-child(4) { animation-delay: 0.35s; }
        .task-card:nth-child(5) { animation-delay: 0.4s; }
        .task-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
          border-color: var(--primary-300);
        }
        .task-card-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .task-checkbox {
          width: 24px;
          height: 24px;
          border: 2px solid var(--gray-300);
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .task-checkbox:hover {
          border-color: var(--primary-500);
          background: var(--primary-50);
        }
        .task-checkbox.completed {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          border-color: transparent;
        }
        .task-content {
          flex: 1;
          min-width: 0;
        }
        .task-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--foreground);
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        .task-title.completed {
          text-decoration: line-through;
          color: var(--foreground-secondary);
        }
        .task-description {
          font-size: 0.875rem;
          color: var(--foreground-secondary);
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }
        .task-meta-row {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }
        .task-meta-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8125rem;
          color: var(--foreground-secondary);
        }
        .task-project {
          font-weight: 600;
          color: var(--primary-600);
        }
        .task-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
          margin-top: 0.75rem;
        }
        .task-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .badge {
          padding: 0.375rem 0.75rem;
          border-radius: 8px;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .task-actions {
          display: flex;
          gap: 0.5rem;
        }
        .action-btn {
          padding: 0.5rem 1rem;
          font-size: 0.8125rem;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-view {
          background: var(--primary-100);
          color: var(--primary-700);
        }
        .btn-view:hover {
          background: var(--primary-200);
        }
        .btn-complete {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(17, 153, 142, 0.3);
        }
        .btn-complete:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(17, 153, 142, 0.4);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 768px) {
          .filter-bar {
            flex-direction: column;
          }
          .task-footer {
            flex-direction: column;
            align-items: flex-start;
          }
          .task-actions {
            width: 100%;
          }
          .action-btn {
            flex: 1;
          }
        }
      `}</style>

      {/* Page Header */}
      <div className="page-header">
        <h1>My Tasks</h1>
        <p>Manage and track all your assigned tasks in one place.</p>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-bar">
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select 
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Tasks</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Priority</label>
            <select 
              className="filter-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Due Date</label>
            <input type="date" className="filter-input" />
          </div>
        </div>
        <div className="quick-filters">
          <div className="quick-filter-chip active">
            <span>📋</span> All Tasks <span style={{ marginLeft: '0.25rem', opacity: 0.7 }}>({tasks.length})</span>
          </div>
          <div className="quick-filter-chip">
            <span>📅</span> Today
          </div>
          <div className="quick-filter-chip">
            <span>📆</span> This Week
          </div>
          <div className="quick-filter-chip">
            <span>⚠️</span> Overdue
          </div>
        </div>
      </div>

      {/* Tasks Container */}
      <div className="tasks-container">
        <div className="tasks-header">
          <div className="tasks-title">
            <span>📋</span> Your Tasks
          </div>
          <span className="task-count">{tasks.length} tasks</span>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-foreground-secondary">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-foreground-secondary">
            <p className="text-xl mb-2">📋</p>
            <p>No tasks found</p>
          </div>
        ) : (
          tasks.map((task) => {
            const statusStyle = getStatusStyle(task.status);
            const priorityStyle = getPriorityStyle(task.priority);
            const isCompleted = task.status === 'Completed';

            return (
              <div key={task.taskId} className="task-card">
                <div className="task-card-header">
                  <div className={`task-checkbox ${isCompleted ? 'completed' : ''}`} onClick={() => !isCompleted && handleMarkComplete(task.taskId)}>
                    {isCompleted && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="task-content">
                    <div className={`task-title ${isCompleted ? 'completed' : ''}`}>
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="task-description">{task.description}</div>
                    )}
                    <div className="task-meta-row">
                      <div className="task-meta-item">
                        <span>📁</span>
                        <span className="task-project">{task.projectName}</span>
                      </div>
                      <div className="task-meta-item">
                        <span>📅</span>
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="task-footer">
                  <div className="task-badges">
                    <span className="badge" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                      {task.status}
                    </span>
                    <span className="badge" style={{ background: priorityStyle.bg, color: priorityStyle.color }}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="task-actions">
                    <Link href={`/tasks/${task.taskId}`} className="action-btn btn-view">
                      View Details
                    </Link>
                    {!isCompleted && (
                      <button className="action-btn btn-complete" onClick={() => handleMarkComplete(task.taskId)}>
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
