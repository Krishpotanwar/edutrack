'use client';

import Link from 'next/link';
import { useThemeStore } from '@/stores/theme-store';
import { useAuthStore } from '@/stores/auth-store';
import { GlassCard } from '@/components/glass';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  ChevronRight,
} from 'lucide-react';

const menuItems = [
  { href: '/users', icon: Users, label: 'User Management', adminOnly: true },
  { href: '/reports', icon: BarChart3, label: 'Reports & Analytics' },
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: '/help', icon: HelpCircle, label: 'Help & Support' },
];

export default function MorePage() {
  const { theme, setTheme } = useThemeStore();
  const { user, logout } = useAuthStore();

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">More</h1>
        <p className="text-muted-foreground">Settings and additional options</p>
      </div>

      {/* Menu Items */}
      <GlassCard className="divide-y divide-border/50 p-0">
        {filteredMenuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors tap-target"
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{item.label}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        ))}
      </GlassCard>

      {/* Theme Toggle */}
      <GlassCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Moon className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Sun className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark theme
              </p>
            </div>
          </div>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          />
        </div>
      </GlassCard>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full h-12 text-destructive hover:text-destructive"
        onClick={logout}
      >
        <LogOut className="h-5 w-5 mr-2" />
        Sign Out
      </Button>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground">
        EduTrack v1.0.0
      </p>
    </div>
  );
}
