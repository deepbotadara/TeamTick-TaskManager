'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface RoleOption {
  roleId: number;
  roleName: string;
}

interface UserData {
  userId: number;
  username: string;
  email: string;
  createdAt: string;
  roles: string[];
  roleIds: number[];
  taskCount: number;
}

export default function Users() {
  const router = useRouter();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRoleIds, setFormRoleIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  // Delete confirmation
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) { router.push('/login'); return; }
    if (authUser.role !== 'Admin') { router.push('/dashboard'); return; }
    fetchUsers();
  }, [authLoading, authUser]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) { router.push('/login'); return; }
      const json = await res.json();
      setUsers(json.data || []);
      setRoles(json.roles || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormUsername('');
    setFormEmail('');
    setFormPassword('');
    setFormRoleIds([3]);
    setModalError('');
    setShowModal(true);
  };

  const openEditModal = (user: UserData) => {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormEmail(user.email);
    setFormPassword('');
    setFormRoleIds(user.roleIds || []);
    setModalError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formUsername.trim() || !formEmail.trim()) {
      setModalError('Username and email are required');
      return;
    }
    if (!editingUser && !formPassword.trim()) {
      setModalError('Password is required for new users');
      return;
    }
    setSaving(true);
    setModalError('');
    try {
      const token = localStorage.getItem('token');
      if (editingUser) {
        const res = await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: editingUser.userId,
            username: formUsername.trim(),
            email: formEmail.trim(),
            roleIds: formRoleIds
          })
        });
        const data = await res.json();
        if (!res.ok) { setModalError(data.error || 'Failed to update user'); return; }
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formUsername.trim(),
            email: formEmail.trim(),
            password: formPassword,
            roleIds: formRoleIds
          })
        });
        const data = await res.json();
        if (!res.ok) { setModalError(data.error || 'Failed to create user'); return; }
      }
      setShowModal(false);
      fetchUsers();
    } catch {
      setModalError('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users?userId=${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDeletingUserId(null);
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch {
      alert('Failed to delete user');
    }
  };

  const toggleRole = (roleId: number) => {
    setFormRoleIds(prev =>
      prev.includes(roleId)
        ? prev.filter(r => r !== roleId)
        : [...prev, roleId]
    );
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
        .btn-new { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; font-size: 0.9375rem; font-weight: 600; color: white; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); border: none; border-radius: 12px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(17,153,142,0.3); }
        .btn-new:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(17,153,142,0.4); }
        .users-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; }
        .user-card { background: var(--background-secondary); border-radius: 16px; border: 1px solid var(--border-color); padding: 1.5rem; transition: all 0.3s ease; animation: fadeInUp 0.5s ease-out backwards; }
        .user-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); }
        .user-header { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.25rem; }
        .user-avatar { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.25rem; flex-shrink: 0; }
        .user-info { flex: 1; min-width: 0; }
        .user-name { font-weight: 700; font-size: 1.125rem; color: var(--foreground); margin-bottom: 0.25rem; }
        .user-email { font-size: 0.875rem; color: var(--foreground-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .user-roles { display: flex; gap: 0.375rem; flex-wrap: wrap; margin-bottom: 1rem; }
        .role-badge { padding: 0.25rem 0.75rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600; }
        .user-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem; }
        .stat-item { background: var(--gray-50); border-radius: 12px; padding: 0.75rem; text-align: center; }
        .stat-value { font-size: 1.25rem; font-weight: 800; color: var(--foreground); }
        .stat-label { font-size: 0.75rem; color: var(--foreground-secondary); }
        .user-actions { display: flex; gap: 0.5rem; }
        .btn-edit { flex: 1; padding: 0.625rem; font-size: 0.8125rem; font-weight: 600; border: none; border-radius: 10px; cursor: pointer; transition: all 0.2s; background: var(--primary-100); color: var(--primary-700); }
        .btn-edit:hover { background: var(--primary-200); }
        .btn-delete { flex: 1; padding: 0.625rem; font-size: 0.8125rem; font-weight: 600; border: none; border-radius: 10px; cursor: pointer; transition: all 0.2s; background: var(--danger-100); color: var(--danger-600); }
        .btn-delete:hover { background: var(--danger-200); }
        .empty-state { text-align: center; padding: 4rem; color: var(--foreground-secondary); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .modal-box { background: var(--background-secondary); border-radius: 16px; padding: 2rem; width: 90%; max-width: 500px; }
        .modal-box h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--foreground); }
        .form-group { margin-bottom: 1rem; }
        .form-label { display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.375rem; color: var(--foreground); }
        .form-input { width: 100%; padding: 0.75rem; font-size: 0.9375rem; background: var(--gray-50); border: 2px solid var(--border-color); border-radius: 10px; color: var(--foreground); box-sizing: border-box; }
        .form-input:focus { outline: none; border-color: var(--primary-500); }
        .role-selector { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .role-chip { padding: 0.5rem 1rem; border-radius: 10px; font-size: 0.875rem; font-weight: 600; border: 2px solid var(--border-color); cursor: pointer; transition: all 0.2s; background: var(--background); color: var(--foreground-secondary); }
        .role-chip-active { border-color: var(--primary-500); background: var(--primary-100); color: var(--primary-700); }
        .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
        .btn-cancel { padding: 0.75rem 1.5rem; border-radius: 10px; border: none; cursor: pointer; font-weight: 600; background: var(--gray-100); color: var(--foreground); }
        .btn-save { padding: 0.75rem 1.5rem; border-radius: 10px; border: none; cursor: pointer; font-weight: 600; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
        .error-msg { color: var(--danger-600); font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; }
        .confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 110; }
        .confirm-box { background: var(--background-secondary); border-radius: 16px; padding: 2rem; width: 90%; max-width: 400px; text-align: center; }
        .confirm-box h3 { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--foreground); }
        .confirm-box p { font-size: 0.875rem; color: var(--foreground-secondary); margin-bottom: 1.5rem; }
        .confirm-actions { display: flex; gap: 1rem; justify-content: center; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Delete Confirmation */}
      {deletingUserId !== null && (
        <div className="confirm-overlay" onClick={() => setDeletingUserId(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <h3>Delete User</h3>
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={() => setDeletingUserId(null)}>Cancel</button>
              <button className="btn-delete" style={{ flex: 'none', padding: '0.75rem 1.5rem' }} onClick={() => handleDelete(deletingUserId)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>{editingUser ? 'Edit User' : 'Create New User'}</h2>
            {modalError && <div className="error-msg">{modalError}</div>}
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input className="form-input" value={formUsername} onChange={e => setFormUsername(e.target.value)} placeholder="Enter username" />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="Enter email" />
            </div>
            {!editingUser && (
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="form-input" type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)} placeholder="Enter password" />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Assign Roles</label>
              <div className="role-selector">
                {roles.map(role => (
                  <button
                    key={role.roleId}
                    type="button"
                    className={`role-chip ${formRoleIds.includes(role.roleId) ? 'role-chip-active' : ''}`}
                    onClick={() => toggleRole(role.roleId)}
                  >
                    {role.roleName}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-save" disabled={saving} onClick={handleSave}>
                {saving ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <h1>User & Role Management</h1>
        <button className="btn-new" onClick={openCreateModal}>
          <span>+</span> Add User
        </button>
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
              <div className="user-actions">
                <button className="btn-edit" onClick={() => openEditModal(user)}>✏️ Edit</button>
                <button className="btn-delete" onClick={() => setDeletingUserId(user.userId)}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
