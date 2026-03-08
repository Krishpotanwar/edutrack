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
  Monitor,
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
          ? 'text-primary font-semibold bg-primary/[0.08]' 
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Thin gradient left accent bar */}
      {isActive && (
        <motion.div
          className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-gradient-to-b from-[#EC4899] to-[#8B5CF6]"
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
      layout
      className={cn(
        'flex flex-col h-full glass border-r border-border/50 relative z-40',
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
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              className="text-xl font-bold text-primary"
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
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
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
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.div>
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
      <div className="p-4 border-t border-border/50 space-y-2">
        <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-3 relative overflow-hidden hover:bg-accent/60',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              collapsed && 'justify-center px-0'
            )}
            onClick={() => {
              const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
              setTheme(next);
            }}
            aria-label={
              theme === 'system' ? 'Using system theme — click for light mode'
                : theme === 'light' ? 'Light mode — click for dark mode'
                : 'Dark mode — click for system theme'
            }
          >
            <motion.div
              animate={{ rotate: theme === 'dark' ? 0 : theme === 'light' ? 180 : 90 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" aria-hidden="true" />
              ) : theme === 'light' ? (
                <Moon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Monitor className="h-5 w-5" aria-hidden="true" />
              )}
            </motion.div>
            {!collapsed && (
              <span>
                {theme === 'dark' ? 'Light Mode' : theme === 'light' ? 'Dark Mode' : 'System Theme'}
              </span>
            )}
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              collapsed && 'justify-center px-0'
            )}
            onClick={logout}
            aria-label="Logout from account"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            {!collapsed && <span>Logout</span>}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
