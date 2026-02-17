'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface TaskListItem {
  ListID: number;
  ListName: string;
  ProjectID: number;
  TaskCount: number;
}

export default function ProjectTaskLists() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [taskLists, setTaskLists] = useState<TaskListItem[]>([]);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }
      const headers = { 'Authorization': `Bearer ${token}` };

      const [listsRes, projectRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/lists`, { headers }),
        fetch(`/api/projects/${projectId}`, { headers })
      ]);

      if (listsRes.status === 401) { router.push('/login'); return; }

      if (listsRes.ok) {
        const listsData = await listsRes.json();
        setTaskLists(listsData.data || []);
      }
      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProjectName(projectData.ProjectName || '');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddList = async () => {
    if (!newListName.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/projects/${projectId}/lists`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ listName: newListName })
      });
      if (res.ok) {
        setNewListName('');
        setShowAddModal(false);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create list');
      }
    } catch { alert('Failed to create list'); }
  };

  const getListColor = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('completed') || n.includes('done')) return '#11998e';
    if (n.includes('progress') || n.includes('active')) return '#667eea';
    if (n.includes('pending') || n.includes('todo') || n.includes('to do')) return '#f2994a';
    if (n.includes('review')) return '#f093fb';
    if (n.includes('backlog')) return '#6b7280';
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

  return (
    <div className="task-lists-page">
      <style jsx>{`
        .task-lists-page { animation: fadeIn 0.5s ease-out; }
        .breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--foreground-secondary); margin-bottom: 1.5rem; }
        .breadcrumb a { color: var(--primary-500); text-decoration: none; }
        .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
        .page-header h1 { font-size: 1.875rem; font-weight: 700; color: var(--foreground); }
        .btn-add { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; font-size: 0.9375rem; font-weight: 600; color: white; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); border: none; border-radius: 12px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(17, 153, 142, 0.3); }
        .btn-add:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(17, 153, 142, 0.4); }
        .lists-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
        .list-card { background: var(--background-secondary); border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; transition: all 0.3s ease; animation: fadeInUp 0.5s ease-out backwards; }
        .list-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1); }
        .list-header { height: 6px; }
        .list-body { padding: 1.5rem; }
        .list-name { font-size: 1.25rem; font-weight: 700; color: var(--foreground); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.75rem; }
        .list-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
        .list-count { font-size: 0.9375rem; color: var(--foreground-secondary); margin-bottom: 1rem; }
        .list-actions { display: flex; gap: 0.5rem; }
        .action-btn { flex: 1; padding: 0.625rem; font-size: 0.8125rem; font-weight: 600; border-radius: 10px; cursor: pointer; transition: all 0.2s; text-align: center; border: none; text-decoration: none; display: block; }
        .action-btn-kanban { background: var(--primary-50); color: var(--primary-600); }
        .action-btn-kanban:hover { background: var(--primary-100); }
        .action-btn-add { background: var(--success-50); color: var(--success-600); }
        .action-btn-add:hover { background: var(--success-100); }
        .edit-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .edit-modal { background: var(--background-secondary); border-radius: 16px; padding: 2rem; width: 90%; max-width: 400px; }
        .edit-modal h2 { margin-bottom: 1.5rem; font-size: 1.25rem; }
        .edit-modal input { width: 100%; padding: 0.875rem 1rem; font-size: 1rem; background: var(--gray-50); border: 2px solid var(--border-color); border-radius: 12px; color: var(--foreground); margin-bottom: 1rem; }
        .edit-modal input:focus { outline: none; border-color: var(--primary-500); }
        .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; }
        .modal-btn { padding: 0.75rem 1.5rem; border-radius: 10px; border: none; cursor: pointer; font-weight: 600; }
        .modal-btn-primary { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; }
        .modal-btn-secondary { background: var(--gray-100); color: var(--foreground); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {showAddModal && (
        <div className="edit-overlay" onClick={() => setShowAddModal(false)}>
          <div className="edit-modal" onClick={e => e.stopPropagation()}>
            <h2>Add Task List</h2>
            <input
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              placeholder="List name (e.g., To Do, In Progress)"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleAddList()}
            />
            <div className="modal-actions">
              <button className="modal-btn modal-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="modal-btn modal-btn-primary" onClick={handleAddList}>Create List</button>
            </div>
          </div>
        </div>
      )}

      <nav className="breadcrumb">
        <Link href="/projects">Projects</Link>
        <span>/</span>
        <Link href={`/projects/${projectId}`}>{projectName || 'Project'}</Link>
        <span>/</span>
        <span>Task Lists</span>
      </nav>

      <div className="page-header">
        <h1>Task Lists</h1>
        <button className="btn-add" onClick={() => setShowAddModal(true)}>
          <span>+</span> Add Task List
        </button>
      </div>

      {taskLists.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--foreground-secondary)' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</p>
          <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No task lists yet</p>
          <p>Create your first task list to start organizing tasks.</p>
        </div>
      ) : (
        <div className="lists-grid">
          {taskLists.map((list, i) => {
            const color = getListColor(list.ListName);
            return (
              <div key={list.ListID} className="list-card" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="list-header" style={{ background: color }}></div>
                <div className="list-body">
                  <h3 className="list-name">
                    <div className="list-icon" style={{ background: `${color}20`, color }}>📋</div>
                    {list.ListName}
                  </h3>
                  <p className="list-count">{list.TaskCount} tasks</p>
                  <div className="list-actions">
                    <Link href={`/projects/${projectId}/lists/${list.ListID}/kanban`} className="action-btn action-btn-kanban">
                      Kanban Board
                    </Link>
                    <Link href={`/projects/${projectId}/lists/${list.ListID}/tasks/create`} className="action-btn action-btn-add">
                      + Add Task
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
