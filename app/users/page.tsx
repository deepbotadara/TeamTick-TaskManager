'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
  userId: number;
  username: string;
  email: string;
  createdAt: string;
  roles: string[];
  taskCount: number;
}

export default function Users() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) { router.push('/login'); return; }
      const json = await res.json();
      setUsers(json.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'Admin': return { bg: 'var(--danger-100)', color: 'var(--danger-600)' };
      case 'Manager': return { bg: 'var(--primary-100)', color: 'var(--primary-700)' };
      case 'Developer': return { bg: 'var(--success-100)', color: 'var(--success-600)' };
      default: return { bg: 'var(--warning-100)', color: 'var(--warning-600)' };
    }
  };

  const avatarColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    'linear-gradient(135deg, #f2994a 0%, #f093fb 100%)',
    'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
    'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--primary-500)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="users-page">
      <style jsx>{`
        .users-page { animation: fadeIn 0.5s ease-out; }
        .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .page-header h1 { font-size: 1.875rem; font-weight: 700; color: var(--foreground); }
        .users-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .user-card { background: var(--background-secondary); border-radius: 16px; border: 1px solid var(--border-color); padding: 1.5rem; transition: all 0.3s ease; animation: fadeInUp 0.5s ease-out backwards; }
        .user-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); }
        .user-header { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.25rem; }
        .user-avatar { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.25rem; flex-shrink: 0; }
        .user-info { flex: 1; min-width: 0; }
        .user-name { font-weight: 700; font-size: 1.125rem; color: var(--foreground); margin-bottom: 0.25rem; }
        .user-email { font-size: 0.875rem; color: var(--foreground-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .user-roles { display: flex; gap: 0.375rem; flex-wrap: wrap; margin-bottom: 1rem; }
        .role-badge { padding: 0.25rem 0.75rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600; }
        .user-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .stat-item { background: var(--gray-50); border-radius: 12px; padding: 0.75rem; text-align: center; }
        .stat-value { font-size: 1.25rem; font-weight: 800; color: var(--foreground); }
        .stat-label { font-size: 0.75rem; color: var(--foreground-secondary); }
        .empty-state { text-align: center; padding: 4rem; color: var(--foreground-secondary); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="page-header">
        <h1>Team Members</h1>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">No users found</div>
      ) : (
        <div className="users-grid">
          {users.map((user, idx) => (
            <div key={user.userId} className="user-card" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="user-header">
                <div className="user-avatar" style={{ background: avatarColors[idx % avatarColors.length] }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <div className="user-name">{user.username}</div>
                  <div className="user-email">{user.email}</div>
                </div>
              </div>
              <div className="user-roles">
                {user.roles.map(role => {
                  const s = getRoleStyle(role);
                  return <span key={role} className="role-badge" style={{ background: s.bg, color: s.color }}>{role}</span>;
                })}
                {user.roles.length === 0 && <span className="role-badge" style={{ background: 'var(--gray-100)', color: 'var(--foreground-secondary)' }}>No Role</span>}
              </div>
              <div className="user-stats">
                <div className="stat-item">
                  <div className="stat-value">{user.taskCount}</div>
                  <div className="stat-label">Assigned Tasks</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</div>
                  <div className="stat-label">Joined</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
