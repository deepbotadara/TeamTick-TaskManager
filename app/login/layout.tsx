'use client';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <style jsx global>{`
        .sidebar {
          display: none !important;
        }
        .main-content {
          margin-left: 0 !important;
        }
      `}</style>
            {children}
        </>
    );
}
