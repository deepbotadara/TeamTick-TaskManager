'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Comment {
  commentId: number;
  commentText: string;
  createdAt: string;
  user: { userId: number; username: string };
}

interface HistoryItem {
  historyId: number;
  changeType: string;
  changeTime: string;
  changedBy: { userId: number; username: string };
}

interface TaskData {
  taskId: number;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  listId: number;
  createdAt: string;
  assignedTo: { userId: number; username: string; email: string } | null;
  comments: Comment[];
  history: HistoryItem[];
}

export default function TaskDetail() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [task, setTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }

      const res = await fetch(`/api/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) throw new Error('Failed to fetch task');

      const data = await res.json();
      setTask(data);
      setEditTitle(data.title);
      setEditDesc(data.description || '');
      setEditPriority(data.priority || 'Medium');
      setEditStatus(data.status || 'Pending');
      setEditDueDate(data.dueDate ? data.dueDate.split('T')[0] : '');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentText: commentText.trim() })
      });
      if (res.ok) {
        setCommentText('');
        fetchTask();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add comment');
      }
    } catch { alert('Failed to add comment'); }
    finally { setSubmittingComment(false); }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchTask();
    } catch { alert('Failed to update status'); }
  };

  const handleEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDesc || null,
          priority: editPriority,
          status: editStatus,
          dueDate: editDueDate || null
        })
      });
      if (res.ok) {
        setEditing(false);
        fetchTask();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update');
      }
    } catch { alert('Failed to update task'); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) router.push('/my-tasks');
      else alert('Failed to delete task');
    } catch { alert('Failed to delete task'); }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--primary-500)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--danger-500)', fontSize: '1.25rem' }}>{error || 'Task not found'}</p>
        <Link href="/my-tasks" style={{ color: 'var(--primary-500)', marginTop: '1rem', display: 'inline-block' }}>← Back to My Tasks</Link>
      </div>
    );
  }

  return (
    <div className="task-detail-page">
      <style jsx>{`
        .task-detail-page { animation: fadeIn 0.5s ease-out; }
        .breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--foreground-secondary); margin-bottom: 1.5rem; }
        .breadcrumb a { color: var(--primary-500); text-decoration: none; }
        .content-grid { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; }
        @media (max-width: 1024px) { .content-grid { grid-template-columns: 1fr; } }
        .main-card { background: var(--background-secondary); border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; }
        .task-header { padding: 2rem; border-bottom: 1px solid var(--border-color); }
        .task-badges { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
        .badge { padding: 0.375rem 0.875rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.02em; }
        .badge-status { background: var(--primary-100); color: var(--primary-700); }
        .badge-priority-high { background: var(--danger-100); color: var(--danger-600); }
        .badge-priority-medium { background: var(--warning-100); color: var(--warning-600); }
        .badge-priority-low { background: var(--success-100); color: var(--success-600); }
        .task-title { font-size: 1.75rem; font-weight: 700; color: var(--foreground); margin-bottom: 1rem; }
        .task-desc { font-size: 1rem; color: var(--foreground-secondary); line-height: 1.7; }
        .section { padding: 1.5rem 2rem; border-bottom: 1px solid var(--border-color); }
        .section:last-child { border-bottom: none; }
        .section-title { font-size: 1rem; font-weight: 700; color: var(--foreground); margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; }
        .comments-list { display: flex; flex-direction: column; gap: 1rem; }
        .comment-item { display: flex; gap: 1rem; }
        .comment-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 0.875rem; flex-shrink: 0; }
        .comment-content { flex: 1; background: var(--gray-50); border-radius: 12px; padding: 1rem; }
        .comment-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
        .comment-author { font-weight: 600; font-size: 0.875rem; color: var(--foreground); }
        .comment-time { font-size: 0.75rem; color: var(--foreground-secondary); }
        .comment-text { font-size: 0.9375rem; color: var(--foreground); line-height: 1.5; }
        .add-comment { display: flex; gap: 1rem; margin-top: 1.5rem; }
        .comment-input { flex: 1; padding: 0.875rem 1rem; font-size: 0.9375rem; background: var(--gray-50); border: 2px solid var(--border-color); border-radius: 12px; color: var(--foreground); transition: all 0.2s; }
        .comment-input:focus { outline: none; border-color: var(--primary-500); background: var(--background-secondary); }
        .comment-btn { padding: 0.875rem 1.5rem; font-size: 0.875rem; font-weight: 600; color: white; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
        .comment-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3); }
        .comment-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .timeline { position: relative; padding-left: 1.75rem; }
        .timeline::before { content: ''; position: absolute; left: 5px; top: 8px; bottom: 8px; width: 2px; background: var(--border-color); }
        .timeline-item { position: relative; padding-bottom: 1.25rem; }
        .timeline-item:last-child { padding-bottom: 0; }
        .timeline-item::before { content: ''; position: absolute; left: -1.75rem; top: 0.375rem; width: 12px; height: 12px; background: var(--primary-500); border-radius: 50%; border: 3px solid var(--background-secondary); }
        .timeline-date { font-size: 0.75rem; color: var(--foreground-secondary); margin-bottom: 0.25rem; }
        .timeline-text { font-size: 0.875rem; color: var(--foreground); }
        .timeline-user { font-weight: 500; }
        .sidebar-card { background: var(--background-secondary); border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; margin-bottom: 1.5rem; }
        .sidebar-section { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
        .sidebar-section:last-child { border-bottom: none; }
        .sidebar-title { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--foreground-secondary); margin-bottom: 0.75rem; }
        .sidebar-value { font-size: 0.9375rem; color: var(--foreground); font-weight: 500; }
        .assignee-row { display: flex; align-items: center; gap: 0.75rem; }
        .assignee-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 0.875rem; }
        .action-buttons { display: flex; flex-direction: column; gap: 0.75rem; }
        .action-btn { padding: 0.875rem 1rem; font-size: 0.9375rem; font-weight: 600; border-radius: 12px; cursor: pointer; transition: all 0.2s; text-align: center; border: none; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .action-btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .action-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3); }
        .action-btn-success { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; }
        .action-btn-success:hover { transform: translateY(-2px); }
        .action-btn-secondary { background: var(--gray-100); color: var(--foreground); border: 2px solid var(--border-color); }
        .action-btn-secondary:hover { border-color: var(--primary-500); color: var(--primary-500); }
        .action-btn-danger { background: var(--danger-50); color: var(--danger-600); }
        .action-btn-danger:hover { background: var(--danger-100); }
        .edit-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .edit-modal { background: var(--background-secondary); border-radius: 16px; padding: 2rem; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
        .edit-modal h2 { margin-bottom: 1.5rem; }
        .edit-group { margin-bottom: 1rem; }
        .edit-group label { display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.375rem; }
        .edit-group input, .edit-group textarea, .edit-group select { width: 100%; padding: 0.75rem; font-size: 0.9375rem; background: var(--gray-50); border: 2px solid var(--border-color); border-radius: 10px; color: var(--foreground); }
        .edit-group input:focus, .edit-group textarea:focus, .edit-group select:focus { outline: none; border-color: var(--primary-500); }
        .edit-group textarea { min-height: 80px; resize: vertical; }
        .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
        .modal-btn { padding: 0.75rem 1.5rem; border-radius: 10px; border: none; cursor: pointer; font-weight: 600; }
        .modal-btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .modal-btn-secondary { background: var(--gray-100); color: var(--foreground); }
        .empty-state { text-align: center; padding: 1.5rem; color: var(--foreground-secondary); font-size: 0.875rem; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-color-scheme: dark) { .comment-content { background: var(--gray-800); } }
      `}</style>

      {/* Edit Modal */}
      {editing && (
        <div className="edit-overlay" onClick={() => setEditing(false)}>
          <div className="edit-modal" onClick={e => e.stopPropagation()}>
            <h2>Edit Task</h2>
            <div className="edit-group">
              <label>Title</label>
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            </div>
            <div className="edit-group">
              <label>Description</label>
              <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} />
            </div>
            <div className="edit-group">
              <label>Priority</label>
              <select value={editPriority} onChange={e => setEditPriority(e.target.value)}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="edit-group">
              <label>Status</label>
              <select value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="edit-group">
              <label>Due Date</label>
              <input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="modal-btn modal-btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              <button className="modal-btn modal-btn-primary" onClick={handleEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <nav className="breadcrumb">
        <Link href="/my-tasks">My Tasks</Link>
        <span>/</span>
        <span>{task.title}</span>
      </nav>

      <div className="content-grid">
        <div>
          <div className="main-card">
            <div className="task-header">
              <div className="task-badges">
                <span className="badge badge-status">{task.status}</span>
                <span className={`badge badge-priority-${(task.priority || 'medium').toLowerCase()}`}>
                  {task.priority} Priority
                </span>
              </div>
              <h1 className="task-title">{task.title}</h1>
              <p className="task-desc">{task.description || 'No description provided'}</p>
            </div>

            <div className="section">
              <h2 className="section-title"><span>💬</span> Comments ({task.comments.length})</h2>
              {task.comments.length > 0 ? (
                <div className="comments-list">
                  {task.comments.map((comment) => (
                    <div key={comment.commentId} className="comment-item">
                      <div className="comment-avatar">{comment.user.username.charAt(0).toUpperCase()}</div>
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-author">{comment.user.username}</span>
                          <span className="comment-time">{getTimeAgo(comment.createdAt)}</span>
                        </div>
                        <p className="comment-text">{comment.commentText}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No comments yet. Be the first to comment!</div>
              )}
              <form className="add-comment" onSubmit={handleAddComment}>
                <input type="text" className="comment-input" placeholder="Add a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} />
                <button type="submit" className="comment-btn" disabled={submittingComment}>
                  {submittingComment ? '...' : 'Post'}
                </button>
              </form>
            </div>

            <div className="section">
              <h2 className="section-title"><span>📜</span> Change History</h2>
              {task.history.length > 0 ? (
                <div className="timeline">
                  {task.history.map((item) => (
                    <div key={item.historyId} className="timeline-item">
                      <div className="timeline-date">{new Date(item.changeTime).toLocaleDateString()}</div>
                      <div className="timeline-text">
                        {item.changeType} by <span className="timeline-user">{item.changedBy.username}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No history available</div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="sidebar-card">
            <div className="sidebar-section">
              <div className="sidebar-title">Assignee</div>
              {task.assignedTo ? (
                <div className="assignee-row">
                  <div className="assignee-avatar">{task.assignedTo.username.charAt(0).toUpperCase()}</div>
                  <div className="sidebar-value">{task.assignedTo.username}</div>
                </div>
              ) : (
                <div className="sidebar-value" style={{ color: 'var(--foreground-secondary)' }}>Unassigned</div>
              )}
            </div>
            <div className="sidebar-section">
              <div className="sidebar-title">Due Date</div>
              <div className="sidebar-value">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</div>
            </div>
            <div className="sidebar-section">
              <div className="sidebar-title">Created</div>
              <div className="sidebar-value">{task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}</div>
            </div>
          </div>

          <div className="sidebar-card">
            <div className="sidebar-section">
              <div className="sidebar-title">Actions</div>
              <div className="action-buttons">
                {task.status !== 'Completed' ? (
                  <button className="action-btn action-btn-success" onClick={() => handleStatusChange('Completed')}>
                    ✓ Mark Complete
                  </button>
                ) : (
                  <button className="action-btn action-btn-primary" onClick={() => handleStatusChange('In Progress')}>
                    ↺ Reopen Task
                  </button>
                )}
                <button className="action-btn action-btn-primary" onClick={() => setEditing(true)}>
                  ✏️ Edit Task
                </button>
                <button className="action-btn action-btn-danger" onClick={handleDelete}>
                  🗑️ Delete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
