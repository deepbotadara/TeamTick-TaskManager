'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardData {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  myTasks: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
  };
  upcomingDeadlines: {
    taskId: number;
    title: string;
    dueDate: string;
    priority: string;
    status: string;
  }[];
}

export default function Analytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }
      const res = await fetch('/api/analytics/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) { router.push('/login'); return; }
      const json = await res.json();
      setData(json.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const completionRate = data && data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0;
  const myCompletionRate = data && data.myTasks.total > 0 ? Math.round((data.myTasks.completed / data.myTasks.total) * 100) : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--primary-500)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--foreground-secondary)' }}>No analytics data available</div>;
  }

  return (
    <div className="analytics-page">
      <style jsx>{`
        .analytics-page { animation: fadeIn 0.5s ease-out; }
        .page-header { margin-bottom: 2rem; }
        .page-header h1 { font-size: 1.875rem; font-weight: 700; color: var(--foreground); margin-bottom: 0.5rem; }
        .page-header p { color: var(--foreground-secondary); }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .metric-card { background: var(--background-secondary); border-radius: 16px; padding: 1.5rem; border: 1px solid var(--border-color); display: flex; align-items: flex-start; gap: 1rem; transition: all 0.3s ease; animation: fadeInUp 0.5s ease-out backwards; }
        .metric-card:nth-child(1) { animation-delay: 0.05s; }
        .metric-card:nth-child(2) { animation-delay: 0.1s; }
        .metric-card:nth-child(3) { animation-delay: 0.15s; }
        .metric-card:nth-child(4) { animation-delay: 0.2s; }
        .metric-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); }
        .metric-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; }
        .metric-content { flex: 1; }
        .metric-label { font-size: 0.8125rem; color: var(--foreground-secondary); margin-bottom: 0.25rem; }
        .metric-value { font-size: 1.75rem; font-weight: 800; color: var(--foreground); }
        .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
        @media (max-width: 900px) { .section-grid { grid-template-columns: 1fr; } }
        .section-card { background: var(--background-secondary); border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; }
        .section-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
        .section-title { font-size: 1rem; font-weight: 700; color: var(--foreground); display: flex; align-items: center; gap: 0.5rem; }
        .section-body { padding: 1.5rem; }
        .progress-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
        .progress-row:last-child { margin-bottom: 0; }
        .progress-label { font-size: 0.875rem; font-weight: 600; color: var(--foreground); min-width: 90px; }
        .progress-bar-bg { flex: 1; height: 10px; background: var(--gray-100); border-radius: 999px; overflow: hidden; }
        .progress-bar { height: 100%; border-radius: 999px; transition: width 1s ease; }
        .progress-count { font-size: 0.875rem; font-weight: 700; color: var(--foreground); min-width: 32px; text-align: right; }
        .completion-ring { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 1rem 0; }
        .ring-container { position: relative; width: 140px; height: 140px; }
        .ring-label { font-size: 0.875rem; color: var(--foreground-secondary); text-align: center; }
        .ring-value { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; color: var(--foreground); }
        .deadline-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .deadline-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: var(--gray-50); border-radius: 12px; transition: all 0.2s; text-decoration: none; color: inherit; }
        .deadline-item:hover { background: var(--gray-100); transform: translateX(4px); }
        .deadline-title { font-size: 0.9375rem; font-weight: 600; color: var(--foreground); flex: 1; }
        .deadline-date { font-size: 0.8125rem; color: var(--foreground-secondary); }
        .badge { padding: 0.25rem 0.625rem; border-radius: 8px; font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; }
        .badge-high { background: var(--danger-100); color: var(--danger-600); }
        .badge-medium { background: var(--warning-100); color: var(--warning-600); }
        .badge-low { background: var(--success-100); color: var(--success-600); }
        .empty-state { text-align: center; padding: 2rem; color: var(--foreground-secondary); font-size: 0.875rem; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="page-header">
        <h1>Analytics Dashboard</h1>
        <p>Overview of your projects, tasks, and productivity</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(99,102,241,0.1)' }}>📁</div>
          <div className="metric-content">
            <div className="metric-label">Total Projects</div>
            <div className="metric-value">{data.totalProjects}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(17,153,142,0.1)' }}>✅</div>
          <div className="metric-content">
            <div className="metric-label">Completed Tasks</div>
            <div className="metric-value">{data.completedTasks}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(99,102,241,0.1)' }}>⏳</div>
          <div className="metric-content">
            <div className="metric-label">In Progress</div>
            <div className="metric-value">{data.inProgressTasks}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(242,153,74,0.1)' }}>📋</div>
          <div className="metric-content">
            <div className="metric-label">Pending Tasks</div>
            <div className="metric-value">{data.pendingTasks}</div>
          </div>
        </div>
      </div>

      <div className="section-grid">
        <div className="section-card">
          <div className="section-header">
            <div className="section-title"><span>📊</span> Task Distribution</div>
          </div>
          <div className="section-body">
            <div className="progress-row">
              <span className="progress-label">Completed</span>
              <div className="progress-bar-bg">
                <div className="progress-bar" style={{ width: `${data.totalTasks > 0 ? (data.completedTasks / data.totalTasks * 100) : 0}%`, background: 'linear-gradient(135deg, #11998e, #38ef7d)' }} />
              </div>
              <span className="progress-count">{data.completedTasks}</span>
            </div>
            <div className="progress-row">
              <span className="progress-label">In Progress</span>
              <div className="progress-bar-bg">
                <div className="progress-bar" style={{ width: `${data.totalTasks > 0 ? (data.inProgressTasks / data.totalTasks * 100) : 0}%`, background: 'linear-gradient(135deg, #667eea, #764ba2)' }} />
              </div>
              <span className="progress-count">{data.inProgressTasks}</span>
            </div>
            <div className="progress-row">
              <span className="progress-label">Pending</span>
              <div className="progress-bar-bg">
                <div className="progress-bar" style={{ width: `${data.totalTasks > 0 ? (data.pendingTasks / data.totalTasks * 100) : 0}%`, background: 'linear-gradient(135deg, #f2994a, #f093fb)' }} />
              </div>
              <span className="progress-count">{data.pendingTasks}</span>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <div className="section-title"><span>🎯</span> Completion Rate</div>
          </div>
          <div className="section-body">
            <div className="completion-ring">
              <div className="ring-container">
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="58" fill="none" stroke="var(--gray-100)" strokeWidth="12" />
                  <circle cx="70" cy="70" r="58" fill="none" stroke="url(#gradient)" strokeWidth="12"
                    strokeDasharray={`${completionRate * 3.64} ${364 - completionRate * 3.64}`}
                    strokeDashoffset="91" strokeLinecap="round" />
                  <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" /><stop offset="100%" stopColor="#764ba2" />
                  </linearGradient></defs>
                </svg>
                <div className="ring-value">{completionRate}%</div>
              </div>
              <div className="ring-label">Overall: {data.completedTasks} of {data.totalTasks} tasks completed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-grid">
        <div className="section-card">
          <div className="section-header">
            <div className="section-title"><span>👤</span> My Tasks Summary</div>
          </div>
          <div className="section-body">
            <div className="progress-row">
              <span className="progress-label">Completed</span>
              <div className="progress-bar-bg">
                <div className="progress-bar" style={{ width: `${data.myTasks.total > 0 ? (data.myTasks.completed / data.myTasks.total * 100) : 0}%`, background: 'linear-gradient(135deg, #11998e, #38ef7d)' }} />
              </div>
              <span className="progress-count">{data.myTasks.completed}</span>
            </div>
            <div className="progress-row">
              <span className="progress-label">In Progress</span>
              <div className="progress-bar-bg">
                <div className="progress-bar" style={{ width: `${data.myTasks.total > 0 ? (data.myTasks.inProgress / data.myTasks.total * 100) : 0}%`, background: 'linear-gradient(135deg, #667eea, #764ba2)' }} />
              </div>
              <span className="progress-count">{data.myTasks.inProgress}</span>
            </div>
            <div className="progress-row">
              <span className="progress-label">Pending</span>
              <div className="progress-bar-bg">
                <div className="progress-bar" style={{ width: `${data.myTasks.total > 0 ? (data.myTasks.pending / data.myTasks.total * 100) : 0}%`, background: 'linear-gradient(135deg, #f2994a, #f093fb)' }} />
              </div>
              <span className="progress-count">{data.myTasks.pending}</span>
            </div>
            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--foreground-secondary)' }}>
              My Completion Rate: <strong style={{ color: 'var(--foreground)' }}>{myCompletionRate}%</strong>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <div className="section-title"><span>⏰</span> Upcoming Deadlines</div>
          </div>
          <div className="section-body">
            {data.upcomingDeadlines.length > 0 ? (
              <div className="deadline-list">
                {data.upcomingDeadlines.map(d => (
                  <Link key={d.taskId} href={`/tasks/${d.taskId}`} className="deadline-item">
                    <span className="deadline-title">{d.title}</span>
                    <span className={`badge badge-${(d.priority || 'medium').toLowerCase()}`}>{d.priority}</span>
                    <span className="deadline-date">{d.dueDate ? new Date(d.dueDate).toLocaleDateString() : 'N/A'}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">No upcoming deadlines</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
