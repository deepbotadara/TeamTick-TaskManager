'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function GlobalBackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide on entry pages where back navigation is not meaningful.
  if (pathname === '/' || pathname === '/dashboard' || pathname === '/login' || pathname === '/register') {
    return null;
  }

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/dashboard');
  };

  return (
    <div className="global-back-wrap">
      <button type="button" onClick={handleBack} className="global-back-btn" aria-label="Go back to previous page">
        <span className="global-back-icon">←</span>
        <span>Back</span>
      </button>
    </div>
  );
}
