'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

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

const SunIcon = () => (
  <svg className="sidebar-link-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1m-16 0H1m15.364 1.636l.707.707m-11.314 0l-.707.707m11.314-11.314l.707-.707m-11.314 0l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="sidebar-link-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const BellIcon = () => (
  <svg className="sidebar-link-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

interface NotificationItem {
  id: string;
  type: 'assigned' | 'due-soon' | 'status-changed';
  taskId: number;
  taskTitle: string;
  message: string;
  createdAt: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);

  useEffect(() => {
    const storedRead = localStorage.getItem('read_notification_ids');
    if (storedRead) {
      try {
        setReadNotificationIds(JSON.parse(storedRead));
      } catch {
        setReadNotificationIds([]);
      }
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/notifications?limit=20', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setNotifications(json.data || []);
      }
    } catch {
      setNotifications([]);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !readNotificationIds.includes(n.id)).length,
    [notifications, readNotificationIds]
  );

  const markAllRead = () => {
    const merged = Array.from(new Set([...readNotificationIds, ...notifications.map((n) => n.id)]));
    setReadNotificationIds(merged);
    localStorage.setItem('read_notification_ids', JSON.stringify(merged));
  };

  const formatNotificationTime = (value: string) => {
    const date = new Date(value);
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const typeLabel = (type: NotificationItem['type']) => {
    if (type === 'assigned') return 'Assigned';
    if (type === 'due-soon') return 'Due Soon';
    return 'Status';
  };

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
    {showNotifications && (
      <div className="notify-overlay" onClick={() => setShowNotifications(false)}>
        <style jsx>{`
          .notify-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.35);
            z-index: 9998;
          }
          .notify-panel {
            position: fixed;
            top: 1.25rem;
            left: 300px;
            width: min(420px, calc(100vw - 2rem));
            max-height: 78vh;
            overflow: auto;
            background: var(--background-secondary);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            box-shadow: 0 18px 50px rgba(0,0,0,0.25);
            z-index: 9999;
            animation: notifyIn 0.2s ease-out;
          }
          .notify-head {
            padding: 0.9rem 1rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
          }
          .notify-title {
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--foreground);
          }
          .notify-mark {
            border: none;
            background: var(--primary-50);
            color: var(--primary-700);
            padding: 0.35rem 0.55rem;
            border-radius: 8px;
            font-size: 0.75rem;
            font-weight: 700;
            cursor: pointer;
          }
          .notify-list {
            padding: 0.5rem;
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
          }
          .notify-item {
            display: block;
            padding: 0.7rem 0.75rem;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            text-decoration: none;
            color: inherit;
            background: var(--background);
            transition: all 0.2s;
          }
          .notify-item:hover {
            border-color: var(--primary-400);
            transform: translateY(-1px);
          }
          .notify-item.unread {
            border-left: 4px solid var(--primary-500);
            background: var(--primary-50);
          }
          .notify-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.5rem;
            margin-bottom: 0.25rem;
          }
          .notify-type {
            font-size: 0.68rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: var(--primary-700);
            background: rgba(99,102,241,0.14);
            padding: 0.17rem 0.45rem;
            border-radius: 999px;
          }
          .notify-time {
            font-size: 0.72rem;
            color: var(--foreground-secondary);
          }
          .notify-task {
            font-size: 0.86rem;
            font-weight: 700;
            color: var(--foreground);
            margin-bottom: 0.22rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .notify-message {
            font-size: 0.78rem;
            color: var(--foreground-secondary);
            line-height: 1.35;
          }
          .notify-empty {
            padding: 1.25rem;
            text-align: center;
            font-size: 0.85rem;
            color: var(--foreground-secondary);
          }
          @keyframes notifyIn {
            from { opacity: 0; transform: translateY(-6px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @media (max-width: 1024px) {
            .notify-panel { left: 94px; }
          }
          @media (max-width: 768px) {
            .notify-panel { left: 1rem; right: 1rem; width: auto; }
          }
        `}</style>
        <div className="notify-panel" onClick={(e) => e.stopPropagation()}>
          <div className="notify-head">
            <div className="notify-title">Notifications</div>
            <button className="notify-mark" onClick={markAllRead}>Mark all read</button>
          </div>
          <div className="notify-list">
            {isLoadingNotifications && <div className="notify-empty">Loading notifications...</div>}
            {!isLoadingNotifications && notifications.length === 0 && (
              <div className="notify-empty">No notifications yet</div>
            )}
            {!isLoadingNotifications && notifications.map((notification) => (
              <Link
                key={notification.id}
                href={`/tasks/${notification.taskId}`}
                className={`notify-item ${readNotificationIds.includes(notification.id) ? '' : 'unread'}`}
                onClick={() => setShowNotifications(false)}
              >
                <div className="notify-row">
                  <span className="notify-type">{typeLabel(notification.type)}</span>
                  <span className="notify-time">{formatNotificationTime(notification.createdAt)}</span>
                </div>
                <div className="notify-task">{notification.taskTitle}</div>
                <div className="notify-message">{notification.message}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    )}

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
        <button
          onClick={() => {
            setShowNotifications((prev) => !prev);
            if (!showNotifications) {
              fetchNotifications();
            }
          }}
          className="sidebar-link"
          style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}
        >
          <BellIcon />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span
              style={{
                marginLeft: 'auto',
                background: '#ef4444',
                color: '#fff',
                fontSize: '0.68rem',
                fontWeight: 700,
                minWidth: '18px',
                height: '18px',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 6px'
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {user?.role === 'Admin' && (
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
          </div>
        )}
        <div className="sidebar-section" style={{ marginTop: 'auto' }}>
          <Link 
            href="/profile" 
            className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`}
          >
            <ProfileIcon />
            <span>Profile</span>
          </Link>
          <button
            onClick={toggleTheme}
            className="sidebar-link"
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            <span>{theme === 'light' ? 'Dark Theme' : 'Light Theme'}</span>
          </button>
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
