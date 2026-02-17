'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface Project {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  _count?: {
    tasks: number;
  };
  tasks?: Array<{ status: string }>;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchProjects();
  }, [authLoading]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }      const data = await response.json();
      // API returns { success, data: [...projects...], pagination }
      const projectsList = data.data || data.projects || [];
      // Map API field names to our interface
      const mapped = projectsList.map((p: any) => ({
        id: p.ProjectID || p.id,
        name: p.ProjectName || p.name,
        description: p.Description || p.description,
        color: p.color || null,
        _count: { tasks: p.TaskCount || 0 },
        tasks: Array.from({ length: p.CompletedTasks || 0 }, () => ({ status: 'Completed' })),
        totalTasks: p.TaskCount || 0,
        completedTasks: p.CompletedTasks || 0,
      }));
      setProjects(mapped);
    } catch (err) {
      setError('Failed to load projects');
      console.error('Error fetching projects:', err);
    } finally {
      setIsLoading(false);
    }
  };
  const getCompletedCount = (project: any) => {
    return project.completedTasks || 0;
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: newProjectName.trim(), description: newProjectDesc.trim() || null })
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewProjectName('');
        setNewProjectDesc('');
        fetchProjects();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create project');
      }
    } catch { alert('Failed to create project'); }
    finally { setCreating(false); }
  };

  const getTotalTasks = (project: any) => {
    return project.totalTasks || project._count?.tasks || 0;
  };

  const getProjectColor = (color: string | null) => {
    return color || '#667eea';
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid var(--border-color)', 
          borderTop: '4px solid var(--primary-500)', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <style jsx>{`
        .projects-page {
          animation: fadeIn 0.5s ease-out;
        }
        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .page-header h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--foreground);
        }
        .page-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--background-secondary);
          border: 2px solid var(--border-color);
          border-radius: 12px;
          padding: 0 1rem;
          transition: all 0.2s;
        }
        .search-box:focus-within {
          border-color: var(--primary-500);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        .search-box svg {
          width: 20px;
          height: 20px;
          color: var(--gray-400);
        }
        .search-box input {
          border: none;
          background: transparent;
          padding: 0.75rem 0;
          font-size: 0.9375rem;
          color: var(--foreground);
          width: 200px;
        }
        .search-box input:focus {
          outline: none;
        }
        .search-box input::placeholder {
          color: var(--gray-400);
        }
        .btn-new {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          font-size: 0.9375rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(17, 153, 142, 0.3);
          text-decoration: none;
        }
        .btn-new:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(17, 153, 142, 0.4);
        }
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.5rem;
        }
        .project-card {
          background: var(--background-secondary);
          border-radius: 16px;
          border: 1px solid var(--border-color);
          overflow: hidden;
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease-out backwards;
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .project-card:nth-child(1) { animation-delay: 0.05s; }
        .project-card:nth-child(2) { animation-delay: 0.1s; }
        .project-card:nth-child(3) { animation-delay: 0.15s; }
        .project-card:nth-child(4) { animation-delay: 0.2s; }
        .project-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
        }
        .project-header {
          height: 8px;
        }
        .project-body {
          padding: 1.5rem;
        }
        .project-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--foreground);
          margin-bottom: 0.5rem;
        }
        .project-desc {
          font-size: 0.875rem;
          color: var(--foreground-secondary);
          line-height: 1.5;
          margin-bottom: 1.25rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .project-progress {
          margin-bottom: 1.25rem;
        }
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .progress-label {
          font-size: 0.75rem;
          color: var(--foreground-secondary);
          font-weight: 600;
        }
        .progress-value {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--foreground);
        }
        .progress-bar-bg {
          height: 8px;
          background: var(--gray-200);
          border-radius: 999px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.5s ease;
        }
        .project-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .project-members {
          display: flex;
        }
        .member-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          margin-left: -8px;
          border: 2px solid var(--background-secondary);
        }
        .member-avatar:first-child {
          margin-left: 0;
        }
        .member-more {
          background: var(--gray-200);
          color: var(--gray-600);
        }
        .project-tasks {
          font-size: 0.875rem;
          color: var(--foreground-secondary);
          font-weight: 500;
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

      {/* Create Project Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowCreateModal(false)}>
          <div style={{ background: 'var(--background-secondary)', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Create New Project</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Project Name *</label>
              <input value={newProjectName} onChange={e => setNewProjectName(e.target.value)} placeholder="Enter project name" style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem', background: 'var(--gray-50)', border: '2px solid var(--border-color)', borderRadius: '10px', color: 'var(--foreground)' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Description</label>
              <textarea value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)} placeholder="Enter project description (optional)" rows={3} style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem', background: 'var(--gray-50)', border: '2px solid var(--border-color)', borderRadius: '10px', color: 'var(--foreground)', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCreateModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, background: 'var(--gray-100)', color: 'var(--foreground)' }}>Cancel</button>
              <button onClick={handleCreateProject} disabled={creating || !newProjectName.trim()} style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', opacity: creating || !newProjectName.trim() ? 0.6 : 1 }}>{creating ? 'Creating...' : 'Create Project'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <h1>Projects</h1>
        <div className="page-actions">
          <div className="search-box">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search projects..." />
          </div>
          <button className="btn-new" onClick={() => setShowCreateModal(true)}>
            <span>+</span> New Project
          </button>
        </div>
      </div>      {/* Projects Grid */}
      <div className="projects-grid">
        {projects.map((project) => {
          const totalTasks = getTotalTasks(project);
          const completedTasks = getCompletedCount(project);
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          const projectColor = getProjectColor(project.color);
          
          return (
            <Link href={`/projects/${project.id}`} key={project.id} className="project-card">
              <div className="project-header" style={{ background: projectColor }}></div>
              <div className="project-body">
                <h3 className="project-name">{project.name}</h3>
                <p className="project-desc">{project.description || 'No description available'}</p>

                <div className="project-progress">
                  <div className="progress-header">
                    <span className="progress-label">Progress</span>
                    <span className="progress-value">{progress}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${progress}%`, background: projectColor }}
                    ></div>
                  </div>
                </div>

                <div className="project-footer">
                  <div className="project-members">
                    <div className="member-avatar">T</div>
                  </div>
                  <span className="project-tasks">{completedTasks}/{totalTasks} tasks</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
