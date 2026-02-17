'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [createdAt, setCreatedAt] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }
      const res = await fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      setUsername(data.username || '');
      setEmail(data.email || '');
      setRoles(data.roles || []);
      setCreatedAt(data.createdAt || '');
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email })
      });
      const data = await res.json();
      if (res.ok) setProfileMsg('Profile updated successfully!');
      else setProfileErr(data.error || 'Failed to update profile');
    } catch { setProfileErr('Failed to update profile'); }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordErr('');
    if (newPassword !== confirmPassword) { setPasswordErr('Passwords do not match'); return; }
    if (newPassword.length < 6) { setPasswordErr('New password must be at least 6 characters'); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/me/password', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else setPasswordErr(data.error || 'Failed to change password');
    } catch { setPasswordErr('Failed to change password'); }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--primary-500)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <style jsx>{`
        .profile-page { animation: fadeIn 0.5s ease-out; max-width: 800px; }
        .page-header { margin-bottom: 2rem; }
        .page-header h1 { font-size: 1.875rem; font-weight: 700; color: var(--foreground); margin-bottom: 0.5rem; }
        .page-header p { color: var(--foreground-secondary); }
        .profile-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; padding: 2rem; display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; position: relative; overflow: hidden; }
        .profile-avatar { width: 100px; height: 100px; border-radius: 50%; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; color: white; font-size: 2.5rem; font-weight: 700; border: 4px solid rgba(255,255,255,0.3); position: relative; z-index: 1; }
        .profile-info { position: relative; z-index: 1; color: white; }
        .profile-name { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem; }
        .profile-email { opacity: 0.9; margin-bottom: 0.5rem; }
        .profile-role { display: inline-block; padding: 0.375rem 0.875rem; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 999px; font-size: 0.8125rem; font-weight: 600; margin-right: 0.5rem; }
        .section-card { background: var(--background-secondary); border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; margin-bottom: 1.5rem; }
        .section-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
        .section-title { font-size: 1rem; font-weight: 700; color: var(--foreground); display: flex; align-items: center; gap: 0.5rem; }
        .section-body { padding: 1.5rem; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group.full-width { grid-column: 1 / -1; }
        .form-label { font-size: 0.875rem; font-weight: 600; color: var(--foreground); }
        .form-input { padding: 0.875rem 1rem; font-size: 1rem; background: var(--gray-50); border: 2px solid var(--border-color); border-radius: 12px; color: var(--foreground); transition: all 0.2s; }
        .form-input:focus { outline: none; border-color: var(--primary-500); background: var(--background-secondary); }
        .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); }
        .btn { padding: 0.875rem 1.5rem; font-size: 0.9375rem; font-weight: 600; border-radius: 12px; cursor: pointer; transition: all 0.2s; border: none; }
        .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; box-shadow: 0 4px 14px rgba(99,102,241,0.3); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99,102,241,0.4); }
        .msg-success { color: var(--success-600); font-size: 0.875rem; margin-top: 0.5rem; font-weight: 500; }
        .msg-error { color: var(--danger-600); font-size: 0.875rem; margin-top: 0.5rem; font-weight: 500; }
        .info-row { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color); }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-size: 0.875rem; color: var(--foreground-secondary); }
        .info-value { font-size: 0.9375rem; font-weight: 500; color: var(--foreground); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="profile-header">
        <div className="profile-avatar">{username ? username.charAt(0).toUpperCase() : '?'}</div>
        <div className="profile-info">
          <div className="profile-name">{username}</div>
          <div className="profile-email">{email}</div>
          <div>{roles.map(r => <span key={r} className="profile-role">{r}</span>)}</div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <div className="section-title"><span>ℹ️</span> Account Information</div>
        </div>
        <div className="section-body">
          <div className="info-row">
            <span className="info-label">Username</span>
            <span className="info-value">{username}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email</span>
            <span className="info-value">{email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Roles</span>
            <span className="info-value">{roles.join(', ') || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Member Since</span>
            <span className="info-value">{createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <div className="section-title"><span>✏️</span> Edit Profile</div>
        </div>
        <div className="section-body">
          <form onSubmit={handleProfileSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-input" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            {profileMsg && <p className="msg-success">{profileMsg}</p>}
            {profileErr && <p className="msg-error">{profileErr}</p>}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <div className="section-title"><span>🔒</span> Change Password</div>
        </div>
        <div className="section-body">
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-input" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
            </div>
            {passwordMsg && <p className="msg-success">{passwordMsg}</p>}
            {passwordErr && <p className="msg-error">{passwordErr}</p>}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Update Password</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
