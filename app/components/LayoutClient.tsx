'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import ProtectedRoute from './ProtectedRoute';
import RedirectIfAuthenticated from './RedirectIfAuthenticated';
import { AuthProvider } from '../contexts/AuthContext';

// Pages that don't require authentication (login/register only)
const publicPages = ['/login', '/register'];

// Pages where logged-in users should be redirected to dashboard
const authPages = ['/', '/login', '/register'];

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide sidebar on auth pages and home page
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/';
  const isPublicPage = publicPages.includes(pathname);

  const renderContent = () => {
    if (authPages.includes(pathname)) {
      // Login/Register/Home: redirect to dashboard if already logged in, or show login
      return <RedirectIfAuthenticated>{children}</RedirectIfAuthenticated>;
    }
    
    // All other pages: require authentication
    return <ProtectedRoute>{children}</ProtectedRoute>;
  };

  return (
    <AuthProvider>
      {!isAuthPage && <Sidebar />}
      <main className={isAuthPage ? '' : 'main-content'}>
        {renderContent()}
      </main>
    </AuthProvider>
  );
}
