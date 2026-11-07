'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { SidebarProvider } from '@/components/layout/SidebarContext';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.replace('/login');
    }
    if (!loading && user && pathname === '/login') {
      router.replace('/');
    }
  }, [user, loading, pathname, router]);

  // Login page — render without sidebar
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Resolving Firebase auth state
  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8892B0] text-xs tracking-[2px] uppercase">VANIR VIP SYSTEM…</p>
        </div>
      </div>
    );
  }

  // Not authenticated — redirect in progress
  if (!user) {
    return null;
  }

  // Authenticated — render responsive admin shell
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-[#0a0a0f] text-right font-sans">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <div className="p-3.5 sm:p-6 w-full max-w-full overflow-x-hidden animate-[fade-in_0.4s_ease-out]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
