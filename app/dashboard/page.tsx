'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  totalProjects: number;
}

interface Task {
  taskId: number;
  title: string;
  projectName: string;
  dueDate: string;
  status: string;
  priority: string;
}

interface Activity {
  id: number;
  taskTitle: string;
  changeType: string;
  changedBy: string;
  changedAt: string;
}

interface ProjectOption {
  projectId: number;
  projectName: string;
  lists: { listId: number; listName: string }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    totalProjects: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const [quickTitle, setQuickTitle] = useState('');
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
  const [selectedListId, setSelectedListId] = useState<number | ''>('');
  const [quickAdding, setQuickAdding] = useState(false);
  const [quickAddMsg, setQuickAddMsg] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const analyticsRes = await fetch('/api/analytics/dashboard', { headers });
      if (analyticsRes.ok) {
        const analyticsJson = await analyticsRes.json();
        const analyticsData = analyticsJson.data || analyticsJson;
        
        setStats({
          totalTasks: analyticsData.totalTasks || 0,
          completedTasks: analyticsData.completedTasks || 0,
          inProgressTasks: analyticsData.inProgressTasks || 0,
          totalProjects: analyticsData.totalProjects || 0,
        });
      }

      const tasksRes = await fetch('/api/tasks/my-tasks', { headers });
      if (tasksRes.ok) {
        const tasksJson = await tasksRes.json();
        const tasksArr = tasksJson.data || tasksJson.tasks || tasksJson;
        setRecentTasks(Array.isArray(tasksArr) ? tasksArr.slice(0, 3) : []);
      }

      const projRes = await fetch('/api/projects?limit=100', { headers });
      if (projRes.ok) {
        const projJson = await projRes.json();
        const projArr = projJson.data || [];
        const mapped: ProjectOption[] = [];
        for (const p of projArr) {
          const pid = p.projectId || p.ProjectID;
          const listsRes = await fetch(`/api/projects/${pid}/lists`, { headers });
          let lists: { listId: number; listName: string }[] = [];
          if (listsRes.ok) {
            const listsJson = await listsRes.json();
            lists = (listsJson.data || []).map((l: any) => ({
              listId: l.ListID || l.listId,
              listName: l.ListName || l.listName,
            }));
          }
          mapped.push({
            projectId: pid,
            projectName: p.projectName || p.ProjectName,
            lists,
          });
        }
        setProjects(mapped);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    if (!selectedListId) {
      setQuickAddMsg('Please select a project and list first.');
      setTimeout(() => setQuickAddMsg(''), 3000);
      return;
    }
    setQuickAdding(true);
    setQuickAddMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/lists/${selectedListId}/tasks`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: quickTitle.trim(), priority: 'Medium', status: 'Pending' }),
      });
      if (res.ok) {
        setQuickTitle('');
        setQuickAddMsg('Task created successfully!');
        fetchDashboardData();
        setTimeout(() => setQuickAddMsg(''), 3000);
      } else {
        const err = await res.json().catch(() => ({}));
        setQuickAddMsg(err.error || 'Failed to create task');
      }
    } catch {
      setQuickAddMsg('Error creating task');
    } finally {
      setQuickAdding(false);
    }
  };

  const selectedProject = projects.find(p => p.projectId === selectedProjectId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-foreground-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="dashboard">
      <style jsx>{`
        .dashboard {
          animation: fadeIn 0.5s ease-out;
        }
        .dashboard-header {
          margin-bottom: 2rem;
        }
        .dashboard-header h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--foreground);
          margin-bottom: 0.5rem;
        }
        .dashboard-header p {
          color: var(--foreground-secondary);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: var(--background-secondary);
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease-out backwards;
        }
        .stat-card:nth-child(1) { animation-delay: 0.05s; }
        .stat-card:nth-child(2) { animation-delay: 0.1s; }
        .stat-card:nth-child(3) { animation-delay: 0.15s; }
        .stat-card:nth-child(4) { animation-delay: 0.2s; }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
        }
        .stat-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        .stat-icon-blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .stat-icon-green { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
        .stat-icon-orange { background: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%); }
        .stat-icon-pink { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .stat-content {
          flex: 1;
        }
        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--foreground);
          line-height: 1.2;
        }
        .stat-label {
          font-size: 0.875rem;
          color: var(--foreground-secondary);
          margin-top: 0.25rem;
        }
        .stat-change {
          font-size: 0.75rem;
          font-weight: 600;
          margin-top: 0.5rem;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
        }
        .stat-change-up {
          background: var(--success-50);
          color: var(--success-600);
        }
        .stat-change-down {
          background: var(--danger-50);
          color: var(--danger-600);
        }
        .main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        @media (max-width: 1200px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
        }
        .section-card {
          background: var(--background-secondary);
          border-radius: 16px;
          border: 1px solid var(--border-color);
          overflow: hidden;
          animation: fadeInUp 0.5s ease-out 0.25s backwards;
        }
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        .section-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--foreground);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .section-action {
          font-size: 0.875rem;
          color: var(--primary-500);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }
        .section-action:hover {
          color: var(--primary-600);
        }
        .section-body {
          padding: 1rem 1.5rem;
        }
        .task-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }
        .task-item {
          display: block;
          padding: 0.95rem;
          background: var(--gray-50);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          transition: all 0.2s;
          text-decoration: none;
          color: inherit;
        }
        .task-item:hover {
          transform: translateY(-2px);
          border-color: rgba(99,102,241,0.35);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }
        .task-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .task-state {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          margin-top: 0.28rem;
          flex-shrink: 0;
          box-shadow: 0 0 0 4px rgba(255,255,255,0.45);
        }
        .task-state-completed { background: #10b981; }
        .task-state-progress { background: #6366f1; }
        .task-state-pending { background: #f59e0b; }
        .task-info {
          min-width: 0;
          flex: 1;
        }
        .task-title {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--foreground);
          margin-bottom: 0.35rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .task-meta {
          font-size: 0.78rem;
          color: var(--foreground-secondary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 0.6rem;
        }
        .task-meta-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.22rem 0.5rem;
          border-radius: 999px;
          background: var(--background-secondary);
          border: 1px solid var(--border-color);
        }
        .task-open {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--primary-500);
          white-space: nowrap;
        }
        .task-badges {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          flex-wrap: wrap;
        }
        .task-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }
        .task-badge {
          padding: 0.25rem 0.625rem;
          border-radius: 999px;
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          white-space: nowrap;
          line-height: 1.4;
        }
        .badge-status-progress { background: rgba(99,102,241,0.15); color: #818cf8; border: 1px solid rgba(99,102,241,0.25); }
        .badge-status-completed { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
        .badge-status-pending { background: rgba(251,191,36,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.25); }
        .badge-priority-high { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
        .badge-priority-medium { background: rgba(251,191,36,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.25); }
        .badge-priority-low { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
        .priority-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 0.2rem;
        }
        .priority-dot-high { background: #f87171; box-shadow: 0 0 6px rgba(248,113,113,0.5); }
        .priority-dot-medium { background: #fbbf24; box-shadow: 0 0 6px rgba(251,191,36,0.5); }
        .priority-dot-low { background: #34d399; box-shadow: 0 0 6px rgba(52,211,153,0.5); }
        @media (max-width: 640px) {
          .task-footer {
            align-items: flex-start;
            flex-direction: column;
          }
        }
        .activity-list {
          display: flex;
          flex-direction: column;
        }
        .activity-item {
          display: flex;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid var(--border-color);
        }
        .activity-item:last-child {
          border-bottom: none;
        }
        .activity-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
          flex-shrink: 0;
        }
        .activity-content {
          flex: 1;
        }
        .activity-text {
          font-size: 0.875rem;
          color: var(--foreground);
          line-height: 1.5;
        }
        .activity-text strong {
          font-weight: 600;
        }
        .activity-time {
          font-size: 0.75rem;
          color: var(--foreground-secondary);
          margin-top: 0.25rem;
        }
        .quick-add {
          animation: fadeInUp 0.5s ease-out 0.35s backwards;
        }
        .quick-add-form {
          display: flex;
          gap: 0.75rem;
        }
        .quick-add-input {
          flex: 1;
          padding: 0.875rem 1rem;
          font-size: 0.9375rem;
          background: var(--background-secondary);
          border: 2px solid var(--border-color);
          border-radius: 12px;
          color: var(--foreground);
          transition: all 0.2s;
        }
        .quick-add-input:focus {
          outline: none;
          border-color: var(--primary-500);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        .quick-add-input::placeholder {
          color: var(--gray-400);
        }
        .quick-add-btn {
          padding: 0.875rem 1.5rem;
          font-size: 0.9375rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .quick-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
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
      `}</style>

      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here&apos;s what&apos;s happening with your projects.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">📋</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalTasks}</div>
            <div className="stat-label">Total Tasks</div>
            <div className="stat-change stat-change-up">↑ Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.completedTasks}</div>
            <div className="stat-label">Completed</div>
            <div className="stat-change stat-change-up">↑ Done</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-orange">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.inProgressTasks}</div>
            <div className="stat-label">In Progress</div>
            <div className="stat-change stat-change-down">↓ Ongoing</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-pink">📁</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalProjects}</div>
            <div className="stat-label">Projects</div>
            <div className="stat-change stat-change-up">↑ Active</div>
          </div>
        </div>
      </div>

      <div className="main-grid">
        <div className="section-card">
          <div className="section-header">
            <div className="section-title">
              <span>📋</span> My Assigned Tasks
            </div>
            <Link href="/my-tasks" className="section-action">View All →</Link>
          </div>
          <div className="section-body">
            <div className="task-list">
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <Link href={`/tasks/${task.taskId}`} key={task.taskId} className="task-item">
                    <div className="task-top">
                      <span className={`task-state ${
                        task.status === 'Completed' ? 'task-state-completed' :
                        task.status === 'In Progress' ? 'task-state-progress' : 'task-state-pending'
                      }`}></span>
                      <div className="task-info">
                        <div className="task-title">{task.title}</div>
                        <div className="task-meta">
                          <span className="task-meta-chip">📁 {task.projectName}</span>
                          <span className="task-meta-chip">📅 {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                        </div>
                      </div>
                      <span className="task-open">Open →</span>
                    </div>
                    <div className="task-footer">
                      <div className="task-badges">
                        <span className={`task-badge badge-priority-${(task.priority || 'medium').toLowerCase()}`}>
                          <span className={`priority-dot priority-dot-${(task.priority || 'medium').toLowerCase()}`}></span>
                          {task.priority || 'Medium'}
                        </span>
                        <span className={`task-badge ${
                          task.status === 'In Progress' ? 'badge-status-progress' :
                          task.status === 'Completed' ? 'badge-status-completed' : 'badge-status-pending'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-4 text-foreground-secondary">
                  No tasks assigned yet
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <div className="section-title">
              <span>🔔</span> Recent Activity
            </div>
            <Link href="/analytics" className="section-action">View All →</Link>
          </div>
          <div className="section-body">
            <div className="activity-list">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-avatar">
                      {activity.changedBy.charAt(0).toUpperCase()}
                    </div>
                    <div className="activity-content">
                      <div className="activity-text">
                        <strong>{activity.changedBy}</strong> {activity.changeType.toLowerCase()} on <strong>{activity.taskTitle}</strong>
                      </div>
                      <div className="activity-time">
                        {new Date(activity.changedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-foreground-secondary">
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="section-card quick-add">
        <div className="section-header">
          <div className="section-title">
            <span>⚡</span> Quick Task Creation
          </div>
        </div>
        <div className="section-body">
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <select
              className="quick-add-input"
              style={{ flex: '1 1 200px' }}
              value={selectedProjectId}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : '';
                setSelectedProjectId(val);
                setSelectedListId('');
              }}
            >
              <option value="">Select Project</option>
              {projects.map(p => (
                <option key={p.projectId} value={p.projectId}>{p.projectName}</option>
              ))}
            </select>
            <select
              className="quick-add-input"
              style={{ flex: '1 1 200px' }}
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value ? Number(e.target.value) : '')}
              disabled={!selectedProjectId}
            >
              <option value="">Select List</option>
              {selectedProject?.lists.map(l => (
                <option key={l.listId} value={l.listId}>{l.listName}</option>
              ))}
            </select>
          </div>
          <form className="quick-add-form" onSubmit={handleQuickAdd}>
            <input
              type="text"
              className="quick-add-input"
              placeholder="What needs to be done?"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
            />
            <button type="submit" className="quick-add-btn" disabled={quickAdding}>
              <span>+</span> {quickAdding ? 'Adding...' : 'Add Task'}
            </button>
          </form>
          {quickAddMsg && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: quickAddMsg.includes('success') ? 'var(--success-600)' : 'var(--danger-600)' }}>
              {quickAddMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
