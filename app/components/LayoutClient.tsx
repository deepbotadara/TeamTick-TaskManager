'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { AuthProvider } from '../contexts/AuthContext';

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide sidebar on auth pages
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <AuthProvider>
      {!isAuthPage && <Sidebar />}
      <main className={isAuthPage ? '' : 'main-content'}>
        {children}
      </main>
    </AuthProvider>
  );
}
