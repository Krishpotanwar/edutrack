'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  User,
  Menu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '/home', icon: LayoutDashboard, label: 'Home' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/events', icon: CalendarDays, label: 'Events' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/more', icon: Menu, label: 'More' },
];

/**
 * BottomNav component with animated active indicator
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-border safe-area-bottom"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 py-2 px-4 tap-target relative overflow-hidden',
                  'transition-colors rounded-xl',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
              >
                {/* Active pill indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      className="absolute inset-1 rounded-xl pointer-events-none bg-primary/15"
                      layoutId="bottomNavPill"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      aria-hidden="true"
                    />
                  )}
                </AnimatePresence>
                
                <div
                  className={cn("relative z-10 transition-transform", isActive && "scale-110 -translate-y-0.5")}
                  aria-hidden="true"
                >
                  <item.icon className="h-5 w-5" />
                </div>
                
                <span 
                  className={cn(
                    "text-xs mt-1 font-medium relative z-10",
                    isActive ? "opacity-100 font-semibold" : "opacity-60"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
