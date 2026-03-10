'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

interface TeamWorkloadItem {
  userId: number;
  username: string;
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}

interface ProjectProgressItem {
  projectId: number;
  projectName: string;
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  completionRate: number;
}

interface DashboardData {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  myTasks: { total: number; completed: number; pending: number; inProgress: number; };
  upcomingDeadlines: { taskId: number; title: string; dueDate: string; priority: string; status: string; }[];
  teamWorkload: TeamWorkloadItem[];
  projectProgress: ProjectProgressItem[];
}

export default function Analytics() {
  const router = useRouter();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const isAdmin = authUser?.role === 'Admin';

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) { router.push('/login'); return; }
    if (authUser.role !== 'Admin') { router.push('/dashboard'); return; }
    fetchAnalytics();
  }, [authLoading, authUser]);

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

  const completionRate = data ? (data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0) : 0;
  const myCompletionRate = data && data.myTasks.total > 0 ? Math.round((data.myTasks.completed / data.myTasks.total) * 100) : 0;
  const displayTotal = data ? (isAdmin ? data.totalTasks : data.myTasks.total) : 0;
  const displayCompleted = data ? (isAdmin ? data.completedTasks : data.myTasks.completed) : 0;
  const displayInProgress = data ? (isAdmin ? data.inProgressTasks : data.myTasks.inProgress) : 0;
  const displayPending = data ? (isAdmin ? data.pendingTasks : data.myTasks.pending) : 0;

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
        .deadline-list { display: flex; flex-direction: column; gap: 0.625rem; }
        .deadline-item { display: flex; align-items: center; gap: 0.875rem; padding: 0.875rem 1rem; background: var(--gray-50); border-radius: 12px; transition: all 0.25s ease; text-decoration: none; color: inherit; border: 1px solid transparent; }
        .deadline-item:hover { background: var(--background-secondary); border-color: var(--border-color); box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateX(4px); }
        .deadline-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
        .deadline-content { flex: 1; min-width: 0; }
        .deadline-title { font-size: 0.875rem; font-weight: 600; color: var(--foreground); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .deadline-subtitle { font-size: 0.75rem; color: var(--foreground-secondary); margin-top: 0.125rem; }
        .deadline-right { flex-shrink: 0; }
        .deadline-date-box { text-align: center; background: var(--background-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.25rem 0.625rem; min-width: 52px; }
        .deadline-date-day { font-size: 0.9375rem; font-weight: 700; color: var(--foreground); line-height: 1.2; }
        .deadline-date-month { font-size: 0.625rem; color: var(--foreground-secondary); text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; }
        .badge { padding: 0.3rem 0.75rem; border-radius: 999px; font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; white-space: nowrap; }
        .badge-high { background: rgba(239,68,68,0.12); color: #dc2626; border: 1px solid rgba(239,68,68,0.2); }
        .badge-medium { background: rgba(245,158,11,0.12); color: #d97706; border: 1px solid rgba(245,158,11,0.2); }
        .badge-low { background: rgba(16,185,129,0.12); color: #059669; border: 1px solid rgba(16,185,129,0.2); }
        /* Team Workload */
        .workload-item { display: flex; align-items: center; gap: 1rem; padding: 0.875rem 0; border-bottom: 1px solid var(--border-color); }
        .workload-item:last-child { border-bottom: none; }
        .workload-avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 0.9375rem; flex-shrink: 0; }
        .workload-info { flex: 1; min-width: 0; }
        .workload-name { font-weight: 600; font-size: 0.9375rem; color: var(--foreground); margin-bottom: 0.35rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .workload-bar-row { display: flex; align-items: center; gap: 0.75rem; }
        .workload-bar-bg { flex: 1; height: 8px; background: var(--gray-100); border-radius: 999px; overflow: hidden; }
        .workload-bar-done { height: 100%; background: linear-gradient(135deg, #11998e, #38ef7d); border-radius: 999px; }
        .workload-counts { display: flex; gap: 0.5rem; flex-shrink: 0; }
        .workload-badge { padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.6875rem; font-weight: 700; }
        .wbadge-done { background: rgba(17,153,142,0.12); color: #11998e; }
        .wbadge-prog { background: rgba(99,102,241,0.12); color: #667eea; }
        .wbadge-pend { background: rgba(242,153,74,0.12); color: #e68a2e; }
        /* Project Progress */
        .proj-item { padding: 1rem 0; border-bottom: 1px solid var(--border-color); }
        .proj-item:last-child { border-bottom: none; }
        .proj-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
        .proj-name { font-weight: 600; font-size: 0.9375rem; color: var(--foreground); }
        .proj-rate { font-size: 0.875rem; font-weight: 700; color: var(--primary-600); }
        .proj-bar-bg { width: 100%; height: 8px; background: var(--gray-100); border-radius: 999px; overflow: hidden; margin-bottom: 0.4rem; }
        .proj-bar-fill { height: 100%; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 999px; transition: width 1s ease; }
        .proj-counts { display: flex; gap: 0.75rem; font-size: 0.75rem; color: var(--foreground-secondary); }
        .empty-state { text-align: center; padding: 2rem; color: var(--foreground-secondary); font-size: 0.875rem; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="page-header">
        <h1>Analytics Dashboard</h1>
        <p>Overview of all projects, tasks, and team productivity</p>
      </div>

      {/* Metric Cards */}
      <div className="metrics-grid">
        {isAdmin && (
          <div className="metric-card">
            <div className="metric-icon" style={{ background: 'rgba(99,102,241,0.1)' }}>📁</div>
            <div className="metric-content">
              <div className="metric-label">Total Projects</div>
              <div className="metric-value">{data.totalProjects}</div>
            </div>
          </div>
        )}
        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(17,153,142,0.1)' }}>✅</div>
          <div className="metric-content">
            <div className="metric-label">Completed Tasks</div>
            <div className="metric-value">{displayCompleted}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(99,102,241,0.1)' }}>⏳</div>
          <div className="metric-content">
            <div className="metric-label">In Progress</div>
            <div className="metric-value">{displayInProgress}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(242,153,74,0.1)' }}>📋</div>
          <div className="metric-content">
            <div className="metric-label">Pending Tasks</div>
            <div className="metric-value">{displayPending}</div>
          </div>
        </div>
      </div>

      {/* Task Distribution + Completion Rate */}
      <div className="section-grid">
        <div className="section-card">
          <div className="section-header">
            <div className="section-title"><span>📊</span> {isAdmin ? 'Overall Task Distribution' : 'My Task Distribution'}</div>
          </div>
          <div className="section-body">
            <div className="progress-row">
              <span className="progress-label">Completed</span>
              <div className="progress-bar-bg"><div className="progress-bar" style={{ width: `${displayTotal > 0 ? (displayCompleted / displayTotal * 100) : 0}%`, background: 'linear-gradient(135deg, #11998e, #38ef7d)' }} /></div>
              <span className="progress-count">{displayCompleted}</span>
            </div>
            <div className="progress-row">
              <span className="progress-label">In Progress</span>
              <div className="progress-bar-bg"><div className="progress-bar" style={{ width: `${displayTotal > 0 ? (displayInProgress / displayTotal * 100) : 0}%`, background: 'linear-gradient(135deg, #667eea, #764ba2)' }} /></div>
              <span className="progress-count">{displayInProgress}</span>
            </div>
            <div className="progress-row">
              <span className="progress-label">Pending</span>
              <div className="progress-bar-bg"><div className="progress-bar" style={{ width: `${displayTotal > 0 ? (displayPending / displayTotal * 100) : 0}%`, background: 'linear-gradient(135deg, #f2994a, #f093fb)' }} /></div>
              <span className="progress-count">{displayPending}</span>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header"><div className="section-title"><span>🎯</span> Completion Rate</div></div>
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
              <div className="ring-label">Overall: {displayCompleted} of {displayTotal} tasks completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Workload Distribution (admin only) + Upcoming Deadlines */}
      <div className="section-grid">
        {isAdmin && (
          <div className="section-card">
            <div className="section-header"><div className="section-title"><span>👥</span> Team Workload Distribution</div></div>
            <div className="section-body">
              {(data.teamWorkload || []).length > 0 ? (
                (data.teamWorkload || []).map(member => (
                  <div key={member.userId} className="workload-item">
                    <div className="workload-avatar">{member.username.charAt(0).toUpperCase()}</div>
                    <div className="workload-info">
                      <div className="workload-name">{member.username}</div>
                      <div className="workload-bar-row">
                        <div className="workload-bar-bg">
                          <div className="workload-bar-done" style={{ width: `${member.total > 0 ? (member.completed / member.total * 100) : 0}%` }} />
                        </div>
                        <div className="workload-counts">
                          <span className="workload-badge wbadge-done">{member.completed}✓</span>
                          <span className="workload-badge wbadge-prog">{member.inProgress}⏳</span>
                          <span className="workload-badge wbadge-pend">{member.pending}📋</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No team data available</div>
              )}
            </div>
          </div>
        )}

        <div className="section-card">
          <div className="section-header"><div className="section-title"><span>⏰</span> Upcoming Deadlines</div></div>
          <div className="section-body">
            {data.upcomingDeadlines.length > 0 ? (
              <div className="deadline-list">
                {data.upcomingDeadlines.map(d => {
                  const dueDate = d.dueDate ? new Date(d.dueDate) : null;
                  const priorityKey = (d.priority || 'medium').toLowerCase();
                  const priorityIcon = priorityKey === 'high' ? '🔴' : priorityKey === 'medium' ? '🟡' : '🟢';
                  return (
                    <Link key={d.taskId} href={`/tasks/${d.taskId}`} className="deadline-item">
                      <div className="deadline-icon">{priorityIcon}</div>
                      <div className="deadline-content">
                        <span className="deadline-title">{d.title}</span>
                        <div className="deadline-subtitle">{d.status} · {d.priority} Priority</div>
                      </div>
                      <div className="deadline-right">
                        <div className="deadline-date-box">
                          <div className="deadline-date-day">{dueDate ? dueDate.getDate() : '--'}</div>
                          <div className="deadline-date-month">{dueDate ? dueDate.toLocaleString('default', { month: 'short' }) : ''}</div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">No upcoming deadlines</div>
            )}
          </div>
        </div>
      </div>

      {/* Project Progress Tracking */}
      <div className="section-card" style={{ marginBottom: '2rem' }}>
        <div className="section-header"><div className="section-title"><span>📈</span> Project Progress Tracking</div></div>
        <div className="section-body">
          {(data.projectProgress || []).length > 0 ? (
            (data.projectProgress || []).map(proj => (
              <div key={proj.projectId} className="proj-item">
                <div className="proj-header-row">
                  <div className="proj-name">{proj.projectName}</div>
                  <div className="proj-rate">{proj.completionRate}%</div>
                </div>
                <div className="proj-bar-bg">
                  <div className="proj-bar-fill" style={{ width: `${proj.completionRate}%` }} />
                </div>
                <div className="proj-counts">
                  <span>✅ {proj.completed} done</span>
                  <span>⏳ {proj.inProgress} in progress</span>
                  <span>📋 {proj.pending} pending</span>
                  <span>📌 {proj.total} total</span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No project data available</div>
          )}
        </div>
      </div>

      {/* My Tasks Summary (admin) */}
      {isAdmin && (
        <div className="section-card">
          <div className="section-header"><div className="section-title"><span>👤</span> My Tasks Summary</div></div>
          <div className="section-body">
            <div className="progress-row">
              <span className="progress-label">Completed</span>
              <div className="progress-bar-bg"><div className="progress-bar" style={{ width: `${data.myTasks.total > 0 ? (data.myTasks.completed / data.myTasks.total * 100) : 0}%`, background: 'linear-gradient(135deg, #11998e, #38ef7d)' }} /></div>
              <span className="progress-count">{data.myTasks.completed}</span>
            </div>
            <div className="progress-row">
              <span className="progress-label">In Progress</span>
              <div className="progress-bar-bg"><div className="progress-bar" style={{ width: `${data.myTasks.total > 0 ? (data.myTasks.inProgress / data.myTasks.total * 100) : 0}%`, background: 'linear-gradient(135deg, #667eea, #764ba2)' }} /></div>
              <span className="progress-count">{data.myTasks.inProgress}</span>
            </div>
            <div className="progress-row">
              <span className="progress-label">Pending</span>
              <div className="progress-bar-bg"><div className="progress-bar" style={{ width: `${data.myTasks.total > 0 ? (data.myTasks.pending / data.myTasks.total * 100) : 0}%`, background: 'linear-gradient(135deg, #f2994a, #f093fb)' }} /></div>
              <span className="progress-count">{data.myTasks.pending}</span>
            </div>
            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--foreground-secondary)' }}>
              My Completion Rate: <strong style={{ color: 'var(--foreground)' }}>{myCompletionRate}%</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
