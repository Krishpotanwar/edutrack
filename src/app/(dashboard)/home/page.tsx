'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CalendarDays, 
  Users, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Sparkles,
  Plus,
  Mail,
  Star,
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import dynamic from 'next/dynamic';
import {
  MiniCalendar,
  TodayEvents,
} from '@/components/dashboard';
import { EventCard } from '@/components/events';
import { SkeletonStatCard, SkeletonChart, SkeletonCard } from '@/components/glass';

const DonutChart = dynamic(
  () => import('@/components/dashboard/donut-chart').then(mod => ({ default: mod.DonutChart })),
  { ssr: false, loading: () => <SkeletonChart /> }
);
const BarChartComponent = dynamic(
  () => import('@/components/dashboard/bar-chart').then(mod => ({ default: mod.BarChartComponent })),
  { ssr: false, loading: () => <SkeletonChart /> }
);
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { GenerateReportModal } from '@/components/reports/generate-report-modal';
import type { DashboardStats, Event } from '@/types';

async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch('/api/dashboard/stats');
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

async function fetchReportsOverview() {
  const response = await fetch('/api/reports/overview');
  if (!response.ok) throw new Error('Failed to fetch reports');
  return response.json();
}

async function fetchEvents(): Promise<{ data: Event[] }> {
  const response = await fetch('/api/events');
  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
}

// Animated counter hook
function useAnimatedCounter(endValue: number, duration: number = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * endValue));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [endValue, duration]);

  return count;
}

// Mini sparkline chart for stat cards
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const gradientId = `spark-${color.replace('#', '')}`;
  return (
    <div className="h-10 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.map((v, i) => ({ v, i }))}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="v" 
            stroke={color} 
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Enhanced stat card with gradient icons, glow, and sparkline
interface EnhancedStatCardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  trend?: { value: number; positive: boolean };
  gradient: string;
  glowColor?: string;
  delay?: number;
  href?: string;
  sparklineData?: number[];
  sparklineColor?: string;
}

function EnhancedStatCard({ 
  icon: Icon, 
  value, 
  label, 
  trend, 
  gradient,
  delay = 0,
  href,
  sparklineData,
  sparklineColor,
}: EnhancedStatCardProps) {
  const animatedValue = useAnimatedCounter(value);

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn("group relative", href && "cursor-pointer")}
    >
      <div className="glass-card !p-5 sm:!p-6 !rounded-2xl transition-transform duration-200 hover:-translate-y-1">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div 
              className={cn(
                "p-3 rounded-xl bg-gradient-to-br shadow-lg",
                gradient
              )}
            >
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>

            {trend && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full',
                  trend.positive
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-rose-500/10 text-rose-400'
                )}
              >
                {trend.positive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{trend.positive ? '+' : ''}{trend.value}%</span>
              </div>
            )}
          </div>

          <div className="mt-4">
            <p className="text-3xl sm:text-4xl font-bold text-foreground">
              {animatedValue.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              {label}
            </p>
          </div>

          {sparklineData && sparklineColor && (
            <MiniSparkline data={sparklineData} color={sparklineColor} />
          )}
        </div>
      </div>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{card}</Link>;
  }
  return card;
}

// Wave emoji animation
function WaveEmoji() {
  return (
    <motion.span
      className="inline-block text-3xl sm:text-4xl ml-2"
      animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
      transition={{ duration: 2.5, delay: 0.5 }}
    >
      👋
    </motion.span>
  );
}

// Section title with gradient
function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.h2 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("text-xl sm:text-2xl font-bold text-foreground", className)}
    >
      {children}
    </motion.h2>
  );
}

// Glass container wrapper
function GlassContainer({ 
  children, 
  className,
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "glass-card !p-0 !rounded-2xl",
        className
      )}
    >
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

// Circular progress for Goals section
function CircularProgress({ percentage, label, sublabel, color }: {
  percentage: number;
  label: string;
  sublabel: string;
  color: string;
}) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth="6"
          />
          <motion.circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-foreground">{percentage}%</span>
        </div>
      </div>
      <p className="text-xs font-medium text-foreground mt-2 text-center">{label}</p>
      <p className="text-[10px] text-muted-foreground text-center">{sublabel}</p>
    </div>
  );
}

// Recent activity data
const recentActivities = [
  { icon: CalendarDays, color: 'bg-blue-500', name: 'New Event Created', text: 'Community Literacy Drive added by coordinator.', time: '25 min ago' },
  { icon: Users, color: 'bg-rose-500', name: 'Volunteer Joined', text: '5 new volunteers registered for Science Workshop.', time: '1 hour ago' },
  { icon: CheckCircle, color: 'bg-emerald-500', name: 'Event Completed', text: 'Rural Education Camp completed successfully.', time: '3 hours ago' },
  { icon: Mail, color: 'bg-violet-500', name: 'Report Submitted', text: 'Monthly impact report submitted for review.', time: '5 hours ago' },
  { icon: Star, color: 'bg-amber-500', name: 'Achievement', text: 'Volunteer milestone: 100 hours contributed.', time: '5 hours ago' },
];

// Goals progress data
const goalsData = [
  { percentage: 54, label: 'Monthly Events', sublabel: '8 of 15', color: '#8B5CF6' },
  { percentage: 68, label: 'Volunteer Retention', sublabel: '340 of 500', color: '#06B6D4' },
  { percentage: 82, label: 'Program Impact', sublabel: '820k of 1M', color: '#10B981' },
  { percentage: 46, label: 'Fund Utilization', sublabel: '92 of 200', color: '#F97316' },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['reports-overview'],
    queryFn: fetchReportsOverview,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const events = eventsData?.data || [];

  const todayEvents = useMemo(() => {
    return events.filter((e: Event) => {
      const eventDate = new Date(e.startDate);
      return eventDate.toDateString() === selectedDate.toDateString();
    });
  }, [events, selectedDate]);

  const upcomingEvents = useMemo(() => {
    return events
      .filter((e: Event) => e.status === 'planned' && new Date(e.startDate) > new Date())
      .sort((a: Event, b: Event) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 6);
  }, [events]);

  const currentDate = format(new Date(), 'EEEE, MMMM d, yyyy');
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        {/* Background decoration */}
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute -top-20 -left-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl opacity-30 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">{currentDate}</span>
            </div>
            <button
              type="button"
              onClick={() => setReportModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white text-sm font-medium shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              New Report
            </button>
          </div>
          
          <h1 className="text-3xl lg:text-4xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {greeting}
            </span>
            {', '}
            <span className="text-foreground">{user?.name?.split(' ')[0] || 'there'}</span>
            <WaveEmoji />
          </h1>
          
          <p className="text-muted-foreground mt-1 text-base sm:text-lg max-w-2xl">
            Here&apos;s what&apos;s happening with your programs today.
          </p>
        </div>
      </motion.div>

      {/* Mini Calendar + Today's Events */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        <MiniCalendar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          eventDates={events.map((e: Event) => new Date(e.startDate))}
        />
        <TodayEvents events={todayEvents} />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsLoading ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : (
          <>
            <EnhancedStatCard
              icon={CalendarDays}
              value={stats?.totalEvents || 0}
              label="Total Events"
              trend={{ value: 12, positive: true }}
              gradient="from-violet-500 to-purple-600"
              glowColor="bg-violet-500/20"
              delay={0}
              href="/events"
              sparklineData={[30, 45, 38, 52, 48, 61, 55]}
              sparklineColor="#8B5CF6"
            />
            <EnhancedStatCard
              icon={Users}
              value={stats?.activeVolunteers || 0}
              label="Active Volunteers"
              trend={{ value: 8, positive: true }}
              gradient="from-pink-500 to-rose-500"
              glowColor="bg-pink-500/20"
              delay={0.1}
              href="/users"
              sparklineData={[120, 135, 148, 142, 156, 170, 165]}
              sparklineColor="#EC4899"
            />
            <EnhancedStatCard
              icon={CheckCircle}
              value={stats?.completedEvents || 0}
              label="Completed Events"
              trend={{ value: 15, positive: true }}
              gradient="from-cyan-500 to-sky-500"
              glowColor="bg-cyan-500/20"
              delay={0.2}
              href="/events"
              sparklineData={[8, 12, 10, 15, 11, 14, 18]}
              sparklineColor="#06B6D4"
            />
            <EnhancedStatCard
              icon={Clock}
              value={stats?.upcomingEvents || 0}
              label="Upcoming Events"
              gradient="from-emerald-500 to-green-500"
              glowColor="bg-emerald-500/20"
              delay={0.3}
              href="/reports"
              sparklineData={[60, 65, 58, 72, 68, 75, 78]}
              sparklineColor="#10B981"
            />
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="space-y-6">
        <SectionTitle>Analytics Overview</SectionTitle>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reportsLoading ? (
            <>
              <SkeletonChart />
              <SkeletonChart />
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="glass-card !p-0 !rounded-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent pointer-events-none" />
                <DonutChart
                  title="Events by Status"
                  data={reportsData?.eventsByStatus || []}
                  className="border-0 bg-transparent shadow-none"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="glass-card !p-0 !rounded-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />
                <BarChartComponent
                  title="Events per Month"
                  data={reportsData?.eventsPerMonth || []}
                  className="border-0 bg-transparent shadow-none"
                />
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Row: Recent Activity + Goals Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <GlassContainer delay={0.6} className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg shrink-0", activity.color)}>
                  <activity.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{activity.name}</span>{' '}
                    <span className="text-muted-foreground">{activity.text}</span>
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </GlassContainer>

        {/* Goals Progress */}
        <GlassContainer delay={0.7} className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Goals Progress</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {goalsData.map((goal) => (
              <CircularProgress
                key={goal.label}
                percentage={goal.percentage}
                label={goal.label}
                sublabel={goal.sublabel}
                color={goal.color}
              />
            ))}
          </div>
        </GlassContainer>
      </div>

      {/* Upcoming Events Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <SectionTitle>Upcoming Events</SectionTitle>
          <Link href="/events" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventsLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : upcomingEvents.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No upcoming events
            </div>
          ) : (
            upcomingEvents.map((event: Event) => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </div>
      </div>

      {/* Bottom decorative element */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex items-center justify-center pt-4"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>EduTrack Dashboard</span>
          <span className="text-primary">•</span>
          <span>Making a difference together</span>
        </div>
      </motion.div>

      <GenerateReportModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} />
    </div>
  );
}
