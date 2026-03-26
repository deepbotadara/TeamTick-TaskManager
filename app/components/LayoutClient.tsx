'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import GlobalBackButton from './GlobalBackButton';
import ProtectedRoute from './ProtectedRoute';
import RedirectIfAuthenticated from './RedirectIfAuthenticated';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';

const publicPages = ['/login', '/register'];

const authPages = ['/', '/login', '/register'];

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/';
  const isPublicPage = publicPages.includes(pathname);

  const renderContent = () => {
    if (authPages.includes(pathname)) {
      return <RedirectIfAuthenticated>{children}</RedirectIfAuthenticated>;
    }
    
    return <ProtectedRoute>{children}</ProtectedRoute>;
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        {!isAuthPage && <Sidebar />}
        <main className={isAuthPage ? '' : 'main-content'}>
          {!isAuthPage && <GlobalBackButton />}
          {renderContent()}
        </main>
      </AuthProvider>
    </ThemeProvider>
  );
}
