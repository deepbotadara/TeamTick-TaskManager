'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="home-page">
      <style jsx>{`
        .home-page {
          min-height: calc(100vh - 4rem);
        }
        .hero {
          text-align: center;
          padding: 4rem 2rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-radius: 24px;
          margin-bottom: 3rem;
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .hero-content {
          position: relative;
          z-index: 1;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          animation: fadeInDown 0.6s ease-out;
        }
        .hero h1 {
          font-size: 3.5rem;
          font-weight: 800;
          color: var(--foreground);
          margin-bottom: 1rem;
          line-height: 1.1;
          animation: fadeInUp 0.6s ease-out;
        }
        .hero h1 span {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero p {
          font-size: 1.25rem;
          color: var(--foreground-secondary);
          max-width: 600px;
          margin: 0 auto 2rem;
          animation: fadeInUp 0.6s ease-out 0.1s backwards;
        }
        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          animation: fadeInUp 0.6s ease-out 0.2s backwards;
        }
        .hero-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .hero-btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }
        .hero-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
        }
        .hero-btn-secondary {
          background: var(--background-secondary);
          color: var(--foreground);
          border: 2px solid var(--border-color);
        }
        .hero-btn-secondary:hover {
          border-color: var(--primary-500);
          color: var(--primary-500);
        }
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        .feature-card {
          background: var(--background-secondary);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease-out backwards;
        }
        .feature-card:nth-child(1) { animation-delay: 0.1s; }
        .feature-card:nth-child(2) { animation-delay: 0.2s; }
        .feature-card:nth-child(3) { animation-delay: 0.3s; }
        .feature-card:nth-child(4) { animation-delay: 0.4s; }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
          border-color: var(--primary-200);
        }
        .feature-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          margin-bottom: 1.25rem;
        }
        .feature-icon-purple {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .feature-icon-green {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        }
        .feature-icon-orange {
          background: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%);
        }
        .feature-icon-pink {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--foreground);
          margin-bottom: 0.5rem;
        }
        .feature-card p {
          color: var(--foreground-secondary);
          line-height: 1.6;
          font-size: 0.9375rem;
        }
        .quick-nav {
          background: var(--background-secondary);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid var(--border-color);
        }
        .quick-nav h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--foreground);
          margin-bottom: 1.5rem;
        }
        .nav-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
        }
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem 1rem;
          background: var(--gray-50);
          border-radius: 12px;
          text-decoration: none;
          color: var(--foreground);
          transition: all 0.2s ease;
        }
        .nav-item:hover {
          background: var(--primary-50);
          color: var(--primary-600);
          transform: translateY(-2px);
        }
        .nav-item-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--primary-100);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }
        .nav-item span {
          font-weight: 600;
          font-size: 0.875rem;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            ✨ Welcome to TaskFlow
          </div>
          <h1>
            Manage Projects<br />
            <span>Like a Pro</span>
          </h1>
          <p>
            Streamline your workflow, collaborate with your team, and deliver projects on time with our intuitive project management platform.
          </p>
          <div className="hero-actions">
            <Link href="/dashboard" className="hero-btn hero-btn-primary">
              <span>🚀</span> Go to Dashboard
            </Link>
            <Link href="/projects" className="hero-btn hero-btn-secondary">
              <span>📁</span> View Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="feature-card">
          <div className="feature-icon feature-icon-purple">📊</div>
          <h3>Dashboard Overview</h3>
          <p>Get a bird&apos;s eye view of all your tasks, deadlines, and team activity in one place.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon feature-icon-green">📋</div>
          <h3>Kanban Boards</h3>
          <p>Visualize your workflow with drag-and-drop task boards for seamless project tracking.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon feature-icon-orange">👥</div>
          <h3>Team Collaboration</h3>
          <p>Assign tasks, add comments, and keep everyone aligned with real-time updates.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon feature-icon-pink">📈</div>
          <h3>Analytics & Reports</h3>
          <p>Track progress, measure productivity, and make data-driven decisions.</p>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="quick-nav">
        <h2>Quick Navigation</h2>
        <div className="nav-grid">
          <Link href="/dashboard" className="nav-item">
            <div className="nav-item-icon">📊</div>
            <span>Dashboard</span>
          </Link>
          <Link href="/projects" className="nav-item">
            <div className="nav-item-icon">📁</div>
            <span>Projects</span>
          </Link>
          <Link href="/my-tasks" className="nav-item">
            <div className="nav-item-icon">✅</div>
            <span>My Tasks</span>
          </Link>
          <Link href="/search" className="nav-item">
            <div className="nav-item-icon">🔍</div>
            <span>Search</span>
          </Link>
          <Link href="/analytics" className="nav-item">
            <div className="nav-item-icon">📈</div>
            <span>Analytics</span>
          </Link>
          <Link href="/profile" className="nav-item">
            <div className="nav-item-icon">👤</div>
            <span>Profile</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
