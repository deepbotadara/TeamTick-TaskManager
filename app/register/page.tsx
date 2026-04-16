'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('User');
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreed) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    const result = await register(name, email, password, role);
    
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Registration failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <style jsx>{`
        .auth-container {
          position: fixed;
          inset: 0;
          display: flex;
          margin-left: 0 !important;
          background: var(--background);
        }
        .auth-left {
          flex: 1;
          background: var(--background-secondary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 4rem;
          position: relative;
          overflow: hidden;
        }
        .auth-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 15% 25%, rgba(99,102,241,0.08), transparent 45%), radial-gradient(circle at 80% 80%, rgba(16,185,129,0.06), transparent 42%);
        }
        .auth-brand {
          position: relative;
          z-index: 1;
        }
        .auth-brand-logo {
          width: 60px;
          height: 60px;
          background: var(--gray-100);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin-bottom: 2rem;
        }
        .auth-brand h1 {
          font-size: 3rem;
          font-weight: 800;
          color: var(--foreground);
          margin-bottom: 1rem;
          line-height: 1.1;
        }
        .auth-brand p {
          font-size: 1.25rem;
          color: var(--foreground-secondary);
          max-width: 400px;
          line-height: 1.6;
        }
        .auth-features {
          margin-top: 3rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          position: relative;
          z-index: 1;
        }
        .auth-feature {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: var(--foreground);
        }
        .auth-feature-icon {
          width: 40px;
          height: 40px;
          background: var(--gray-100);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .auth-right {
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 2rem;
          padding-top: 3rem;
          padding-bottom: 2rem;
          background: var(--background);
          overflow-y: auto;
        }
        .auth-card {
          width: 100%;
          max-width: 460px;
          animation: fadeInUp 0.6s ease-out;
        }
        .auth-header {
          text-align: center;
          margin-bottom: 1.25rem;
        }
        .auth-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--foreground);
          margin-bottom: 0.25rem;
        }
        .auth-header p {
          color: var(--foreground-secondary);
          font-size: 0.9rem;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .form-group label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--foreground);
        }
        .input-wrapper {
          position: relative;
        }
        .input-wrapper svg {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: var(--gray-400);
        }
        .input-wrapper input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          font-size: 0.9375rem;
          background: var(--background-secondary);
          border: 2px solid var(--border-color);
          border-radius: 12px;
          color: var(--foreground);
          transition: all 0.2s ease;
        }
        .input-wrapper input:focus {
          outline: none;
          border-color: var(--primary-500);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        .input-wrapper input::placeholder {
          color: var(--gray-400);
        }
        .password-strength {
          display: flex;
          gap: 0.25rem;
          margin-top: 0.5rem;
        }
        .strength-bar {
          flex: 1;
          height: 4px;
          background: var(--gray-200);
          border-radius: 2px;
          transition: background 0.3s;
        }
        .strength-bar.active {
          background: var(--success-500);
        }
        .terms-check {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: var(--foreground-secondary);
        }
        .terms-check input {
          width: 18px;
          height: 18px;
          margin-top: 0.125rem;
          accent-color: var(--primary-500);
        }
        .terms-check a {
          color: var(--primary-500);
          text-decoration: none;
        }
        .terms-check a:hover {
          text-decoration: underline;
        }
        .role-selector {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }
        .role-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.375rem;
          padding: 0.75rem 0.5rem;
          border: 2px solid var(--border-color);
          border-radius: 12px;
          cursor: pointer;
          background: var(--background-secondary);
          transition: all 0.2s ease;
        }
        .role-option:hover {
          border-color: var(--gray-300);
          background: var(--gray-50);
        }
        .role-option.selected {
          border-color: #11998e;
          background: rgba(17, 153, 142, 0.08);
          box-shadow: 0 0 0 3px rgba(17, 153, 142, 0.1);
        }
        .role-option-radio {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .role-option.selected .role-option-radio {
          border-color: #11998e;
          background: #11998e;
        }
        .role-option.selected .role-option-radio::after {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: white;
        }
        .role-option-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.125rem;
        }
        .role-option-label {
          font-weight: 600;
          font-size: 0.8125rem;
          color: var(--foreground);
        }
        .role-option-desc {
          font-size: 0.675rem;
          color: var(--foreground-secondary);
          line-height: 1.3;
        }
        .submit-btn {
          width: 100%;
          padding: 0.875rem;
          font-size: 1rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(17, 153, 142, 0.4);
          position: relative;
          overflow: hidden;
        }
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(17, 153, 142, 0.5);
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .submit-btn .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .auth-login {
          text-align: center;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
          color: var(--foreground-secondary);
          margin-top: 0.75rem;
          margin-bottom: 1rem;
        }
        .auth-login a {
          color: var(--primary-500);
          font-weight: 600;
          text-decoration: none;
          margin-left: 0.25rem;
          transition: color 0.2s;
        }
        .auth-login a:hover {
          color: var(--primary-600);
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
        @media (max-width: 1024px) {
          .auth-left {
            display: none;
          }
          .auth-container {
            margin-left: 0 !important;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Left Side - Branding */}
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-logo">✓</div>
          <h1>Join TeamTick<br />Today</h1>
          <p>Create your account and start managing projects like never before.</p>
        </div>
        <div className="auth-features">
          <div className="auth-feature">
            <div className="auth-feature-icon">🚀</div>
            <span>Get started in minutes</span>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon">🔒</div>
            <span>Enterprise-grade security</span>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon">💬</div>
            <span>24/7 customer support</span>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create your account</h2>
            <p>Fill in the details to get started</p>
          </div>          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '0.875rem',
                background: 'var(--danger-100)',
                color: 'var(--danger-600)',
                borderRadius: '12px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Register as</label>
              <div className="role-selector">
                <div 
                  className={`role-option ${role === 'User' ? 'selected' : ''}`}
                  onClick={() => setRole('User')}
                >
                  <div className="role-option-radio"></div>
                  <div className="role-option-info">
                    <span className="role-option-label">👤 User</span>
                    <span className="role-option-desc">Manage your own tasks & projects</span>
                  </div>
                </div>
                <div 
                  className={`role-option ${role === 'Project Manager' ? 'selected' : ''}`}
                  onClick={() => setRole('Project Manager')}
                >
                  <div className="role-option-radio"></div>
                  <div className="role-option-info">
                    <span className="role-option-label">📋 Project Manager</span>
                    <span className="role-option-desc">Manage projects, assign tasks & track progress</span>
                  </div>
                </div>
                <div 
                  className={`role-option ${role === 'Admin' ? 'selected' : ''}`}
                  onClick={() => setRole('Admin')}
                >
                  <div className="role-option-radio"></div>
                  <div className="role-option-info">
                    <span className="role-option-label">🛡️ Admin</span>
                    <span className="role-option-desc">Full access: team, analytics & settings</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm</label>
                <div className="input-wrapper">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="password-strength">
              <div className={`strength-bar ${password.length > 0 ? 'active' : ''}`}></div>
              <div className={`strength-bar ${password.length > 4 ? 'active' : ''}`}></div>
              <div className={`strength-bar ${password.length > 8 ? 'active' : ''}`}></div>
              <div className={`strength-bar ${password.length > 12 ? 'active' : ''}`}></div>
            </div>

            <label className="terms-check">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                required
              />
              <span>
                I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
              </span>
            </label>

            <button type="submit" className="submit-btn" disabled={isLoading || !agreed}>
              {isLoading ? <span className="spinner"></span> : 'Create Account'}
            </button>
          </form>

          <div className="auth-login">
            Already have an account?
            <Link href="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
