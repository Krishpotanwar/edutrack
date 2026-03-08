'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Users,
  BarChart3,
  User,
  ChevronLeft,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/stores/theme-store';
import { useAuthStore } from '@/stores/auth-store';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '/home', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/events', icon: CalendarDays, label: 'Events' },
  { href: '/users', icon: Users, label: 'Users', adminOnly: true },
  { href: '/reports', icon: BarChart3, label: 'Reports' },
  { href: '/profile', icon: User, label: 'Profile' },
];

// Navigation item component with clean minimal active state
function NavItem({ item, isActive, collapsed }: { 
  item: typeof navItems[0]; 
  isActive: boolean; 
  collapsed: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all tap-target relative',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isActive 
          ? 'text-primary font-semibold bg-primary/10' 
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Thin gradient left accent bar */}
      {isActive && (
        <motion.div
          className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-primary"
          layoutId="activeNavEdge"
          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
      
      <item.icon 
        className="h-5 w-5 shrink-0 transition-colors" 
        aria-hidden="true" 
      />
      
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useThemeStore();
  const { user, logout } = useAuthStore();

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  return (
    <motion.div
      className={cn(
        'flex flex-col h-full glass border-r border-border relative z-40',
        collapsed ? 'w-20' : 'w-[260px]'
      )}
      initial={false}
      animate={{ 
        width: collapsed ? 80 : 260,
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 350, 
        damping: 30,
        mass: 0.8,
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              EduTrack
            </motion.span>
          )}
        </AnimatePresence>
        <motion.div
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            aria-controls="sidebar-nav"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2" id="sidebar-nav">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <NavItem 
              key={item.href}
              item={item}
              isActive={isActive}
              collapsed={collapsed}
            />
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <div>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-3 relative overflow-hidden text-muted-foreground hover:text-foreground hover:bg-accent',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              collapsed && 'justify-center px-0'
            )}
            onClick={() => {
              setTheme(theme === 'dark' ? 'light' : 'dark');
            }}
            aria-label={
              theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5" aria-hidden="true" />
            )}
            {!collapsed && (
              <span>
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </Button>
        </div>
        <div>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-3 text-red-400/80 hover:text-red-400 hover:bg-red-500/10',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              collapsed && 'justify-center px-0'
            )}
            onClick={logout}
            aria-label="Logout from account"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
