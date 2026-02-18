'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface TaskItem {
  taskId: number;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  assignedTo: { userId: number; username: string; email: string } | null;
}

export default function KanbanBoard() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const listId = params.listId as string;

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projectName, setProjectName] = useState('');
  const [listName, setListName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [projectId, listId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }
      const headers = { 'Authorization': `Bearer ${token}` };

      const [tasksRes, projectRes] = await Promise.all([
        fetch(`/api/lists/${listId}/tasks`, { headers }),
        fetch(`/api/projects/${projectId}`, { headers })
      ]);

      if (tasksRes.status === 401) { router.push('/login'); return; }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.data || []);
      }
      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProjectName(projectData.ProjectName || '');
        const foundList = projectData.taskLists?.find((l: any) => l.ListID === parseInt(listId));
        setListName(foundList?.ListName || 'Task List');
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const columns = [
    { id: 'Pending', name: 'Pending', color: '#f2994a' },
    { id: 'In Progress', name: 'In Progress', color: '#667eea' },
    { id: 'Completed', name: 'Completed', color: '#11998e' },
  ];

  const getTasksForColumn = (status: string) => tasks.filter(t => t.status === status);

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      default: return 'priority-low';
    }
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
    <div className="kanban-page">
      <style jsx>{`
        .kanban-page { animation: fadeIn 0.5s ease-out; }
        .breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--foreground-secondary); margin-bottom: 1.5rem; }
        .breadcrumb a { color: var(--primary-500); text-decoration: none; }
        .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .page-header h1 { font-size: 1.875rem; font-weight: 700; color: var(--foreground); }
        .header-actions { display: flex; gap: 0.75rem; }
        .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; font-size: 0.875rem; font-weight: 600; border-radius: 10px; cursor: pointer; transition: all 0.2s; text-decoration: none; border: none; }
        .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4); }
        .kanban-container { display: flex; gap: 1.5rem; overflow-x: auto; padding-bottom: 2rem; }
        .kanban-column { flex: 0 0 340px; background: var(--background-secondary); border-radius: 16px; display: flex; flex-direction: column; max-height: calc(100vh - 280px); animation: fadeInUp 0.5s ease-out backwards; border: 1px solid var(--border-color); }
        .kanban-column:nth-child(1) { animation-delay: 0.1s; }
        .kanban-column:nth-child(2) { animation-delay: 0.2s; }
        .kanban-column:nth-child(3) { animation-delay: 0.3s; }
        .column-header { padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; }
        .column-title { display: flex; align-items: center; gap: 0.75rem; font-weight: 700; font-size: 1rem; color: var(--foreground); }
        .column-dot { width: 12px; height: 12px; border-radius: 50%; }
        .column-count { background: var(--gray-200); color: var(--foreground-secondary); padding: 0.25rem 0.625rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
        .column-cards { flex: 1; overflow-y: auto; padding: 0 1rem 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .task-card { background: var(--background-secondary); border-radius: 12px; padding: 1rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); border: 1px solid var(--border-color); transition: all 0.2s ease; text-decoration: none; color: inherit; display: block; }
        .task-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); }
        .task-priority { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; margin-bottom: 0.75rem; }
        .priority-high { background: var(--danger-100); color: var(--danger-600); }
        .priority-medium { background: var(--warning-100); color: var(--warning-600); }
        .priority-low { background: var(--success-100); color: var(--success-600); }
        .task-title { font-weight: 600; font-size: 0.9375rem; color: var(--foreground); margin-bottom: 0.75rem; line-height: 1.4; }
        .task-footer { display: flex; align-items: center; justify-content: space-between; }
        .task-assignee { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 0.75rem; font-weight: 600; }
        .task-due { font-size: 0.75rem; color: var(--foreground-secondary); display: flex; align-items: center; gap: 0.375rem; }
        .task-actions-row { display: flex; gap: 0.375rem; margin-top: 0.75rem; }
        .task-action-btn { padding: 0.375rem 0.625rem; font-size: 0.6875rem; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
        .task-action-move { background: var(--primary-50); color: var(--primary-600); }
        .task-action-move:hover { background: var(--primary-100); }
        .task-action-delete { background: var(--danger-50); color: var(--danger-600); }
        .task-action-delete:hover { background: var(--danger-100); }
        .add-task-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.875rem; margin: 0 1rem 1rem; background: transparent; border: 2px dashed var(--gray-300); border-radius: 10px; color: var(--gray-500); font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; text-decoration: none; }
        .add-task-btn:hover { border-color: var(--primary-500); color: var(--primary-500); background: var(--primary-50); }
        .empty-column { text-align: center; padding: 2rem 1rem; color: var(--foreground-secondary); font-size: 0.875rem; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

      `}</style>

      <nav className="breadcrumb">
        <Link href="/projects">Projects</Link>
        <span>/</span>
        <Link href={`/projects/${projectId}`}>{projectName || 'Project'}</Link>
        <span>/</span>
        <Link href={`/projects/${projectId}/lists`}>Lists</Link>
        <span>/</span>
        <span>{listName} - Kanban</span>
      </nav>

      <div className="page-header">
        <h1>{listName} - Kanban Board</h1>
        <div className="header-actions">
          <Link href={`/projects/${projectId}/lists/${listId}/tasks/create`} className="btn btn-primary">
            <span>+</span> Add Task
          </Link>
        </div>
      </div>

      <div className="kanban-container">
        {columns.map((column) => {
          const columnTasks = getTasksForColumn(column.id);
          return (
            <div key={column.id} className="kanban-column">
              <div className="column-header">
                <div className="column-title">
                  <span className="column-dot" style={{ background: column.color }}></span>
                  {column.name}
                  <span className="column-count">{columnTasks.length}</span>
                </div>
              </div>
              <div className="column-cards">
                {columnTasks.length === 0 ? (
                  <div className="empty-column">No tasks</div>
                ) : (
                  columnTasks.map((task) => (
                    <div key={task.taskId} className="task-card">
                      <Link href={`/tasks/${task.taskId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <span className={`task-priority ${getPriorityClass(task.priority || 'Medium')}`}>
                          {task.priority || 'Medium'}
                        </span>
                        <div className="task-title">{task.title}</div>
                        <div className="task-footer">
                          <div className="task-assignee">
                            {task.assignedTo ? task.assignedTo.username.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div className="task-due">
                            {task.dueDate ? (
                              <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {new Date(task.dueDate).toLocaleDateString()}
                              </>
                            ) : 'No due date'}
                          </div>
                        </div>
                      </Link>
                      <div className="task-actions-row">
                        {task.status !== 'Completed' && (
                          <button className="task-action-btn task-action-move"
                            onClick={() => handleStatusChange(task.taskId, task.status === 'Pending' ? 'In Progress' : 'Completed')}>
                            → {task.status === 'Pending' ? 'In Progress' : 'Complete'}
                          </button>
                        )}
                        {task.status === 'Completed' && (
                          <button className="task-action-btn task-action-move"
                            onClick={() => handleStatusChange(task.taskId, 'In Progress')}>
                            ← Reopen
                          </button>
                        )}
                        <button className="task-action-btn task-action-delete"
                          onClick={() => handleDeleteTask(task.taskId)}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Link href={`/projects/${projectId}/lists/${listId}/tasks/create`} className="add-task-btn">
                + Add Task
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
