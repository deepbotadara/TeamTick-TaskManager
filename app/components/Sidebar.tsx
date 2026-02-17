'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

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

  // Helper function to check if link is active
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
  };

  return (
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
          <Link 
            href="/users" 
            className={`sidebar-link ${isActive('/users') ? 'active' : ''}`}
          >
            <UsersIcon />
            <span>Team</span>
          </Link>
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
  );
}
