'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

// SVG Icons as components
const DashboardIcon = () => (
  <svg className="sidebar-link-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const ProjectsIcon = () => (
  <svg className="sidebar-link-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const TasksIcon = () => (
  <svg className="sidebar-link-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const SearchIcon = () => (
  <svg className="sidebar-link-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="sidebar-link-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg className="sidebar-link-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="sidebar-link-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="sidebar-link-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Helper function to check if link is active
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <>
    {/* Logout Confirmation Modal */}
    {showLogoutModal && (
      <div className="logout-overlay" onClick={() => setShowLogoutModal(false)}>
        <style jsx>{`
          .logout-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: overlayIn 0.2s ease-out;
          }
          .logout-modal {
            background: var(--background-secondary);
            border-radius: 20px;
            border: 1px solid var(--border-color);
            padding: 2rem;
            width: 90%;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: modalIn 0.25s ease-out;
          }
          .logout-modal-icon {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(239,68,68,0.1), rgba(220,38,38,0.1));
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.25rem;
            font-size: 1.75rem;
          }
          .logout-modal h3 {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--foreground);
            margin-bottom: 0.5rem;
          }
          .logout-modal p {
            font-size: 0.9375rem;
            color: var(--foreground-secondary);
            margin-bottom: 1.75rem;
            line-height: 1.5;
          }
          .logout-modal-actions {
            display: flex;
            gap: 0.75rem;
          }
          .logout-btn {
            flex: 1;
            padding: 0.75rem 1.25rem;
            font-size: 0.9375rem;
            font-weight: 600;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .logout-btn-cancel {
            background: var(--gray-100);
            color: var(--foreground);
          }
          .logout-btn-cancel:hover {
            background: var(--gray-200);
          }
          .logout-btn-confirm {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);
          }
          .logout-btn-confirm:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
          }
          @keyframes overlayIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
        <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
          <div className="logout-modal-icon">👋</div>
          <h3>Confirm Logout</h3>
          <p>Are you sure you want to log out of your account?</p>
          <div className="logout-modal-actions">
            <button className="logout-btn logout-btn-cancel" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </button>
            <button className="logout-btn logout-btn-confirm" onClick={confirmLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    )}
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">✓</div>
        <span className="sidebar-logo-text">TaskFlow</span>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <Link 
          href="/dashboard" 
          className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
        >
          <DashboardIcon />
          <span>Dashboard</span>
        </Link>
        <Link 
          href="/projects" 
          className={`sidebar-link ${isActive('/projects') ? 'active' : ''}`}
        >
          <ProjectsIcon />
          <span>Projects</span>
        </Link>
        <Link 
          href="/my-tasks" 
          className={`sidebar-link ${isActive('/my-tasks') ? 'active' : ''}`}
        >
          <TasksIcon />
          <span>My Tasks</span>
        </Link>
        <Link 
          href="/search" 
          className={`sidebar-link ${isActive('/search') ? 'active' : ''}`}
        >
          <SearchIcon />
          <span>Search</span>
        </Link>

        {/* Admin Section */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">Administration</div>
          {user?.role === 'Admin' && (
            <Link 
              href="/users" 
              className={`sidebar-link ${isActive('/users') ? 'active' : ''}`}
            >
              <UsersIcon />
              <span>Team</span>
            </Link>
          )}
          <Link 
            href="/analytics" 
            className={`sidebar-link ${isActive('/analytics') ? 'active' : ''}`}
          >
            <AnalyticsIcon />
            <span>Analytics</span>
          </Link>
        </div>        {/* User Section */}
        <div className="sidebar-section" style={{ marginTop: 'auto' }}>
          <Link 
            href="/profile" 
            className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`}
          >
            <ProfileIcon />
            <span>Profile</span>
          </Link>
          <button 
            onClick={handleLogout} 
            className="sidebar-link"
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
    </>
  );
}
