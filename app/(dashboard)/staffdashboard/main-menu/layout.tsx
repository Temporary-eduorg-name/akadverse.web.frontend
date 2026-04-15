'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Lock, ShieldCheck } from 'lucide-react';
import DashboardNavbar from '@/app/components/dashboard/staff/DashboardNavbar';
import DashboardSidebar from '@/app/components/dashboard/staff/DashboardSidebar';

type AuthState = 'checking' | 'authenticated' | 'unauthenticated';

export default function MainMenuLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const mainStyle = useMemo(
    () => ({ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties),
    [sidebarWidth],
  );

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/marketplace/auth/verify', {
          credentials: 'include',
        });

        if (!isMounted) {
          return;
        }

        setAuthState(response.ok ? 'authenticated' : 'unauthenticated');
      } catch {
        if (isMounted) {
          setAuthState('unauthenticated');
        }
      }
    };

    void checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  if (authState === 'authenticated' && pathname.startsWith('/staffdashboard/main-menu/marketplace')) {
    return <>{children}</>;
  }

  if (authState === 'authenticated') {
    return (
      <div className="h-screen overflow-hidden bg-[#f8f9fc] font-sans">
        <DashboardNavbar />
        <div className="relative flex min-h-0" style={{ height: 'calc(100vh - 70px)' }}>
          <DashboardSidebar onWidthChange={setSidebarWidth} />
          <main
            style={mainStyle}
            className="min-w-0 flex-1 overflow-y-auto ml-0 lg:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-out p-4 sm:p-6 lg:p-7 pb-20 lg:pb-7"
          >
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#f8f9fc] font-sans">
      <DashboardNavbar />
      <div className="relative flex min-h-0" style={{ height: 'calc(100vh - 70px)' }}>
        <DashboardSidebar onWidthChange={setSidebarWidth} />
        <main
          style={mainStyle}
          className="min-w-0 flex-1 overflow-y-auto ml-0 lg:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-out p-4 sm:p-6 lg:p-7 pb-20 lg:pb-7"
        >
          <div className="flex min-h-[calc(100vh-140px)] items-center justify-center">
            <div className="w-full max-w-xl rounded-[28px] border border-[#dfe7f2] bg-white px-5 sm:px-8 py-8 sm:py-10 text-center shadow-[0_18px_50px_rgba(15,23,42,0.1)]">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#edf4ff]">
                {authState === 'checking' ? (
                  <ShieldCheck size={42} className="text-[#2f6ef7]" />
                ) : (
                  <Lock size={42} className="text-[#2f6ef7]" />
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#2f3b4f]">
                {authState === 'checking' ? 'Checking your access' : 'Login required'}
              </h1>

              <p className="mx-auto mt-4 max-w-md text-lg leading-8 text-[#64748b]">
                {authState === 'checking'
                  ? 'We are verifying your session before opening the main menu.'
                  : 'You need to be logged in before opening any route inside the main menu.'}
              </p>

              {authState === 'checking' ? (
                <div className="mx-auto mt-8 h-11 w-11 animate-spin rounded-full border-4 border-[#dbe7ff] border-t-[#2f6ef7]" aria-label="Checking login status" />
              ) : (
                <button
                  onClick={() => router.push('/login')}
                  className="mt-8 inline-flex items-center justify-center rounded-[14px] bg-[#2f6ef7] px-8 py-3 text-base font-semibold text-white shadow-[0_6px_16px_rgba(47,110,247,0.28)] transition-colors hover:bg-[#1f5be0]"
                >
                  Go to Login
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
