'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/navigation/sidebar';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { NotificationBell } from '@/components/navigation/notification-bell';
import { NotificationDrawer } from '@/components/notifications/notification-drawer';
import dynamic from 'next/dynamic';
import { Search, Plus } from 'lucide-react';
import { GenerateReportModal } from '@/components/reports/generate-report-modal';

const FloatingLetters = dynamic(
  () => import('@/components/effects/floating-letters').then(mod => ({ default: mod.FloatingLetters })),
  { ssr: false }
);
const GradientMesh = dynamic(
  () => import('@/components/effects/gradient-mesh').then(mod => ({ default: mod.GradientMesh })),
  { ssr: false }
);
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const { user } = useAuthStore();

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const y = el.scrollTop;
    // Hide header when scrolling down past 60px, show when scrolling up
    setHeaderHidden(y > 60 && y > lastScrollY.current);
    lastScrollY.current = y;
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="min-h-screen h-screen overflow-hidden gradient-bg">
      <GradientMesh />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      >
        Skip to main content
      </a>

      <div className="h-full grid grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block h-full">
          <Sidebar />
        </aside>

        <main
          id="main-content"
          className="relative flex flex-col h-full overflow-hidden"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <FloatingLetters
              maxLetters={10}
              spawnRate={200}
              minDistance={40}
              sizeRange={[12, 20]}
              lifetime={2000}
            />
          </div>

          {/* Auto-hide header: slides up on scroll down, back on scroll up */}
          <header
            className="relative z-40 shrink-0 backdrop-blur-sm bg-background/80 border-b border-border px-4 lg:px-6 h-16 flex items-center justify-between gap-4 transition-transform duration-300 ease-in-out"
            style={{ transform: headerHidden ? 'translateY(-100%)' : 'translateY(0)' }}
          >
            {/* Mobile logo */}
            <h1 className="text-lg font-semibold lg:hidden bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              EduTrack
            </h1>

            {/* Search bar - hidden on mobile */}
            <div className="hidden lg:flex items-center flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search events, volunteers..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/30"
                />
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">
              <NotificationBell />
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/20"
              >
                <Plus className="h-4 w-4" />
                New Report
              </button>
              {/* User avatar */}
              <Link href="/profile" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="hidden lg:block text-sm text-muted-foreground">{user?.name || 'User'}</span>
              </Link>
            </div>
          </header>

          <div
            ref={scrollRef}
            className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden"
          >
            <div className="p-4 lg:p-6 pb-24 lg:pb-6">
              {children}
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
      <NotificationDrawer />
      <GenerateReportModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} />
    </div>
  );
}
