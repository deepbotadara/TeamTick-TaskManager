'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface ProjectMember {
  userId: number;
  username: string;
  email: string;
  taskCount: number;
  completed: number;
  isCreator?: boolean;
}

interface AvailableUser {
  userId: number;
  username: string;
  email: string;
}

interface TaskList {
  ListID: number;
  ListName: string;
  TaskCount: number;
}

interface ProjectData {
  ProjectID: number;
  ProjectName: string;
  Description: string | null;
  CreatedBy: number;
  CreatedAt: string;
  CreatorName: string;
  taskLists: TaskList[];
}

export default function ProjectDetails() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [creatorId, setCreatorId] = useState<number | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberSaving, setMemberSaving] = useState(false);
  const [memberError, setMemberError] = useState('');

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }

      const res = await fetch(`/api/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) throw new Error('Failed to fetch project');

      const data = await res.json();
      setProject(data);
      setEditName(data.ProjectName);
      setEditDesc(data.Description || '');

      fetchMembers(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (token: string) => {
    try {
      const mRes = await fetch(`/api/projects/${projectId}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (mRes.ok) {
        const mData = await mRes.json();
        setMembers(mData.data || []);
        setCreatorId(mData.creatorId || null);
        setAvailableUsers(mData.availableUsers || []);
      }
    } catch { }
  };

  const handleAddMember = async () => {
    if (!selectedMemberId) return;

    try {
      setMemberSaving(true);
      setMemberError('');
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: parseInt(selectedMemberId, 10) }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMemberError(data.error || 'Failed to add member');
        return;
      }

      setMembers(data.data || []);
      setAvailableUsers(data.availableUsers || []);
      setCreatorId(data.creatorId || null);
      setSelectedMemberId('');
    } catch {
      setMemberError('Failed to add member');
    } finally {
      setMemberSaving(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    try {
      setMemberSaving(true);
      setMemberError('');
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/projects/${projectId}/members?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        setMemberError(data.error || 'Failed to remove member');
        return;
      }

      setMembers(data.data || []);
      setAvailableUsers(data.availableUsers || []);
      setCreatorId(data.creatorId || null);
    } catch {
      setMemberError('Failed to remove member');
    } finally {
      setMemberSaving(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: editName, description: editDesc })
      });
      if (res.ok) {
        setEditing(false);
        fetchProject();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update project');
      }
    } catch { alert('Failed to update project'); }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        router.push('/projects');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete project');
      }
    } catch { alert('Failed to delete project'); }
  };

  const getListColor = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('completed') || n.includes('done')) return '#11998e';
    if (n.includes('progress') || n.includes('active')) return '#667eea';
    if (n.includes('pending') || n.includes('todo') || n.includes('to do')) return '#f2994a';
    return '#667eea';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--primary-500)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--danger-500)', fontSize: '1.25rem' }}>{error || 'Project not found'}</p>
        <Link href="/projects" style={{ color: 'var(--primary-500)', marginTop: '1rem', display: 'inline-block' }}>← Back to Projects</Link>
      </div>
    );
  }

  const totalTasks = project.taskLists.reduce((sum, l) => sum + l.TaskCount, 0);
  const memberIds = new Set(members.map((member) => member.userId));
  const addableUsers = availableUsers.filter((user) => !memberIds.has(user.userId));

  return (
    <div className="project-details">
      <style jsx>{`
        .project-details { animation: fadeIn 0.5s ease-out; }
        .breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--foreground-secondary); margin-bottom: 1.5rem; }
        .breadcrumb a { color: var(--primary-500); text-decoration: none; transition: color 0.2s; }
        .breadcrumb a:hover { color: var(--primary-600); }
        .project-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; padding: 2rem; color: white; margin-bottom: 2rem; position: relative; overflow: hidden; }
        .project-header::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.14), transparent 45%), radial-gradient(circle at 85% 70%, rgba(255,255,255,0.08), transparent 45%); }
        .project-header-content { position: relative; z-index: 1; }
        .project-header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
        .project-title { font-size: 2rem; font-weight: 800; margin-bottom: 0.75rem; }
        .project-desc { font-size: 1rem; opacity: 0.9; line-height: 1.6; max-width: 700px; }
        .project-meta { display: flex; gap: 2rem; margin-top: 1.5rem; flex-wrap: wrap; }
        .meta-item { display: flex; flex-direction: column; gap: 0.25rem; }
        .meta-label { font-size: 0.75rem; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.05em; }
        .meta-value { font-size: 1rem; font-weight: 600; }
        .header-actions { display: flex; gap: 0.75rem; }
        .header-btn { padding: 0.5rem 1rem; border-radius: 10px; border: none; cursor: pointer; font-weight: 600; font-size: 0.875rem; transition: all 0.2s; }
        .header-btn-edit { background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px); }
        .header-btn-edit:hover { background: rgba(255,255,255,0.3); }
        .header-btn-delete { background: rgba(239,68,68,0.2); color: white; backdrop-filter: blur(10px); }
        .header-btn-delete:hover { background: rgba(239,68,68,0.4); }
        .content-grid { display: grid; grid-template-columns: 1fr 320px; gap: 2rem; }
        @media (max-width: 1024px) { .content-grid { grid-template-columns: 1fr; } }
        .section-card { background: var(--background-secondary); border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; margin-bottom: 1.5rem; }
        .section-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
        .section-title { font-size: 1rem; font-weight: 700; color: var(--foreground); display: flex; align-items: center; gap: 0.5rem; }
        .section-action { font-size: 0.875rem; color: var(--primary-500); text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 0.25rem; }
        .section-body { padding: 1rem 1.5rem; }
        .task-list-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
        .task-list-card { background: var(--gray-50); border-radius: 12px; padding: 1.25rem; text-decoration: none; color: inherit; display: block; transition: all 0.2s; border-left: 4px solid; }
        .task-list-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
        .task-list-name { font-weight: 700; color: var(--foreground); margin-bottom: 0.5rem; }
        .task-list-count { font-size: 0.875rem; color: var(--foreground-secondary); }
        .quick-actions { display: flex; flex-direction: column; gap: 0.75rem; }
        .action-btn { display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: var(--gray-50); border-radius: 12px; text-decoration: none; color: var(--foreground); font-weight: 600; font-size: 0.9375rem; transition: all 0.2s; }
        .action-btn:hover { background: var(--primary-50); color: var(--primary-600); transform: translateX(4px); }
        .action-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; }
        .action-icon-purple { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .action-icon-green { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
        .action-icon-orange { background: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%); }
        .info-item { padding: 0.75rem; background: var(--gray-50); border-radius: 12px; margin-bottom: 0.75rem; }
        .info-label { font-size: 0.75rem; color: var(--foreground-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
        .info-value { font-weight: 600; color: var(--foreground); }
        .edit-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .edit-modal { background: var(--background-secondary); border-radius: 16px; padding: 2rem; width: 90%; max-width: 500px; }
        .edit-modal h2 { margin-bottom: 1.5rem; font-size: 1.25rem; }
        .edit-modal input, .edit-modal textarea { width: 100%; padding: 0.875rem 1rem; font-size: 1rem; background: var(--gray-50); border: 2px solid var(--border-color); border-radius: 12px; color: var(--foreground); margin-bottom: 1rem; }
        .edit-modal textarea { min-height: 100px; resize: vertical; }
        .edit-modal input:focus, .edit-modal textarea:focus { outline: none; border-color: var(--primary-500); }
        .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; }
        .modal-btn { padding: 0.75rem 1.5rem; border-radius: 10px; border: none; cursor: pointer; font-weight: 600; font-size: 0.9375rem; }
        .modal-btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .modal-btn-secondary { background: var(--gray-100); color: var(--foreground); }
        .modal-btn-danger { background: var(--danger-500); color: white; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {editing && (
        <div className="edit-overlay" onClick={() => setEditing(false)}>
          <div className="edit-modal" onClick={e => e.stopPropagation()}>
            <h2>Edit Project</h2>
            <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Project Name" />
            <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Description" />
            <div className="modal-actions">
              <button className="modal-btn modal-btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              <button className="modal-btn modal-btn-primary" onClick={handleUpdate}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="edit-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="edit-modal" onClick={e => e.stopPropagation()}>
            <h2>Delete Project</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--foreground-secondary)' }}>
              Are you sure you want to delete &quot;{project.ProjectName}&quot;? This will delete all task lists and tasks. This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="modal-btn modal-btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="modal-btn modal-btn-danger" onClick={handleDelete}>Delete Project</button>
            </div>
          </div>
        </div>
      )}

      <nav className="breadcrumb">
        <Link href="/projects">Projects</Link>
        <span>/</span>
        <span>{project.ProjectName}</span>
      </nav>

      <div className="project-header">
        <div className="project-header-content">
          <div className="project-header-top">
            <h1 className="project-title">{project.ProjectName}</h1>
            <div className="header-actions">
              <button className="header-btn header-btn-edit" onClick={() => setEditing(true)}>✏️ Edit</button>
              <button className="header-btn header-btn-delete" onClick={() => setShowDeleteConfirm(true)}>🗑️ Delete</button>
            </div>
          </div>
          <p className="project-desc">{project.Description || 'No description provided'}</p>
          <div className="project-meta">
            <div className="meta-item">
              <span className="meta-label">Created By</span>
              <span className="meta-value">{project.CreatorName}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Created</span>
              <span className="meta-value">{new Date(project.CreatedAt).toLocaleDateString()}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Total Tasks</span>
              <span className="meta-value">{totalTasks}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Task Lists</span>
              <span className="meta-value">{project.taskLists.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div>
          <div className="section-card">
            <div className="section-header">
              <div className="section-title"><span>📋</span> Task Lists</div>
              <Link href={`/projects/${project.ProjectID}/lists`} className="section-action">View All →</Link>
            </div>
            <div className="section-body">
              {project.taskLists.length > 0 ? (
                <div className="task-list-grid">
                  {project.taskLists.map((list) => (
                    <Link href={`/projects/${project.ProjectID}/lists/${list.ListID}/kanban`} key={list.ListID} className="task-list-card" style={{ borderLeftColor: getListColor(list.ListName) }}>
                      <div className="task-list-name">{list.ListName}</div>
                      <div className="task-list-count">{list.TaskCount} tasks</div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--foreground-secondary)', textAlign: 'center', padding: '2rem' }}>No task lists yet</p>
              )}
            </div>
          </div>

          <div className="section-card">
            <div className="section-header">
              <div className="section-title"><span>⚡</span> Quick Actions</div>
            </div>
            <div className="section-body">
              <div className="quick-actions">
                {project.taskLists.length > 0 && (
                  <>
                    <Link href={`/projects/${project.ProjectID}/lists/${project.taskLists[0].ListID}/kanban`} className="action-btn">
                      <div className="action-icon action-icon-purple">📊</div>
                      Open Kanban Board
                    </Link>
                    <Link href={`/projects/${project.ProjectID}/lists/${project.taskLists[0].ListID}/tasks/create`} className="action-btn">
                      <div className="action-icon action-icon-green">➕</div>
                      Create New Task
                    </Link>
                  </>
                )}
                <Link href="/analytics" className="action-btn">
                  <div className="action-icon action-icon-orange">📈</div>
                  View Analytics
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="section-card">
            <div className="section-header">
              <div className="section-title"><span>ℹ️</span> Project Info</div>
            </div>
            <div className="section-body">
              <div className="info-item">
                <div className="info-label">Created By</div>
                <div className="info-value">{project.CreatorName}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Created At</div>
                <div className="info-value">{new Date(project.CreatedAt).toLocaleDateString()}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Total Task Lists</div>
                <div className="info-value">{project.taskLists.length}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Total Tasks</div>
                <div className="info-value">{totalTasks}</div>
              </div>
            </div>
          </div>

          <div className="section-card" style={{ marginTop: '1.5rem' }}>
            <div className="section-header">
              <div className="section-title"><span>👥</span> Project Members</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-600)', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setShowMembers(!showMembers)}
                >
                  {showMembers ? 'Hide' : `Show (${members.length})`}
                </button>
              </div>
            </div>
            {showMembers && (
              <div className="section-body">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: '180px',
                      padding: '0.5rem 0.625rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--gray-50)',
                      color: 'var(--foreground)'
                    }}
                  >
                    <option value="">Select user to add</option>
                    {addableUsers.map((user) => (
                      <option key={user.userId} value={String(user.userId)}>
                        {user.username} ({user.email})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddMember}
                    disabled={!selectedMemberId || memberSaving}
                    style={{
                      padding: '0.5rem 0.875rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'var(--primary-500)',
                      color: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer',
                      opacity: !selectedMemberId || memberSaving ? 0.6 : 1,
                    }}
                  >
                    {memberSaving ? 'Saving...' : 'Add'}
                  </button>
                </div>
                {memberError && (
                  <div style={{ marginBottom: '0.75rem', color: 'var(--danger-600)', fontSize: '0.8125rem', fontWeight: 600 }}>
                    {memberError}
                  </div>
                )}
                {members.length > 0 ? (
                  members.map(m => (
                    <div key={m.userId} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: m.userId === creatorId ? 'linear-gradient(135deg,#f2994a,#f093fb)' : 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, flexShrink: 0 }}>
                        {m.username.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {m.username}
                          {m.userId === creatorId && <span style={{ fontSize: '0.6875rem', background: 'rgba(242,153,74,0.15)', color: '#d97706', padding: '0.125rem 0.5rem', borderRadius: '999px', fontWeight: 700 }}>Creator</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--foreground-secondary)' }}>{m.email}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--foreground)' }}>{m.taskCount} tasks</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--success-600)' }}>{m.completed} done</div>
                      </div>
                      {m.userId !== creatorId && (
                        <button
                          onClick={() => handleRemoveMember(m.userId)}
                          disabled={memberSaving}
                          style={{
                            marginLeft: '0.5rem',
                            padding: '0.35rem 0.55rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(239,68,68,0.25)',
                            background: 'rgba(239,68,68,0.08)',
                            color: 'var(--danger-600)',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--foreground-secondary)', textAlign: 'center', padding: '1.5rem' }}>No members yet. Use the selector above to add project members.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
