'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CalendarDays, 
  Users, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Sparkles,
  ArrowRight,
  Calendar,
  Plus
} from 'lucide-react';
import { isToday, parseISO, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import {
  MiniCalendar,
  TodayEvents,
  DonutChart,
  BarChartComponent,
} from '@/components/dashboard';
import { EventCard } from '@/components/events';
import { SkeletonStatCard, SkeletonChart, SkeletonEventCard } from '@/components/glass';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import type { Event, DashboardStats } from '@/types';

async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch('/api/dashboard/stats');
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

async function fetchEvents(): Promise<{ data: Event[] }> {
  const response = await fetch('/api/events');
  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
}

async function fetchReportsOverview() {
  const response = await fetch('/api/reports/overview');
  if (!response.ok) throw new Error('Failed to fetch reports');
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
  glowColor: string;
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
  glowColor,
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
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.2 } 
      }}
      className={cn("group relative", href && "cursor-pointer")}
    >
      {/* Glow effect on hover */}
      <div 
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10",
          glowColor
        )}
      />
      
      {/* Glass card */}
      <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 p-5 sm:p-6 shadow-lg shadow-black/5 dark:shadow-black/20">
        {/* Gradient border overlay */}
        <div className={cn(
          "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          "bg-gradient-to-r p-[1px]",
          gradient
        )}>
          <div className="w-full h-full rounded-2xl bg-white/90 dark:bg-gray-900/90" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            {/* Gradient icon container */}
            <motion.div 
              className={cn(
                "p-3 rounded-xl bg-gradient-to-br shadow-lg",
                gradient
              )}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </motion.div>

            {/* Trend indicator */}
            {trend && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.3, duration: 0.4 }}
                className={cn(
                  'flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full',
                  trend.positive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                )}
              >
                {trend.positive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{trend.positive ? '+' : ''}{trend.value}%</span>
              </motion.div>
            )}
          </div>

          <div className="mt-4">
            <motion.p 
              className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent"
            >
              {animatedValue.toLocaleString()}
            </motion.p>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              {label}
            </p>
          </div>

          {/* Mini sparkline */}
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
      animate={{ 
        rotate: [0, 14, -8, 14, -4, 10, 0],
        transformOrigin: '70% 70%'
      }}
      transition={{ 
        duration: 2.5, 
        repeat: Infinity,
        repeatDelay: 1
      }}
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
      className={cn(
        "text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-primary to-gray-600 dark:from-white dark:via-primary dark:to-gray-400 bg-clip-text text-transparent",
        className
      )}
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
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        y: -4,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        transition: { duration: 0.2 }
      }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20",
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user } = useAuthStore();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });

  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['reports-overview'],
    queryFn: fetchReportsOverview,
  });

  const events = useMemo(() => eventsData?.data || [], [eventsData?.data]);

  const todayEvents = useMemo(() => {
    return events.filter((event) => isToday(parseISO(event.startDate)));
  }, [events]);

  const upcomingEvents = useMemo(() => {
    return events
      .filter((event) => new Date(event.startDate) >= new Date())
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 6);
  }, [events]);

  const eventDates = useMemo(() => {
    return events.map((event) => parseISO(event.startDate));
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
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white text-sm font-medium shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              New Report
            </Link>
          </div>
          
          <h1 className="text-3xl lg:text-4xl font-bold">
            <span className="bg-gradient-to-r from-[#EC4899] via-[#8B5CF6] to-[#6366F1] bg-clip-text text-transparent">
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section - Events Grid (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <SectionTitle>Upcoming Events</SectionTitle>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link 
                href="/events"
                className="group flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View all
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="wait">
              {eventsLoading ? (
                <>
                  <SkeletonEventCard />
                  <SkeletonEventCard />
                  <SkeletonEventCard />
                  <SkeletonEventCard />
                </>
              ) : upcomingEvents.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full"
                >
                  <GlassContainer className="p-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No upcoming events scheduled</p>
                    <Link 
                      href="/events/new"
                      className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-primary hover:text-primary/80"
                    >
                      Create an event
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </GlassContainer>
                </motion.div>
              ) : (
                upcomingEvents.slice(0, 4).map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Section - Calendar & Today's Events (1/3) */}
        <div className="space-y-6">
          {/* Mini Calendar */}
          <GlassContainer delay={0.2} className="p-0">
            <div className="p-1">
              <MiniCalendar
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                eventDates={eventDates}
              />
            </div>
          </GlassContainer>

          {/* Today's Events */}
          <GlassContainer delay={0.3} className="p-0">
            <div className="p-1">
              <TodayEvents events={todayEvents} />
            </div>
          </GlassContainer>
        </div>
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
                whileHover={{ 
                  y: -4,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                  transition: { duration: 0.2 }
                }}
                className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20"
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
                whileHover={{ 
                  y: -4,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                  transition: { duration: 0.2 }
                }}
                className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20"
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

      {/* Bottom Quick Actions (optional decorative element) */}
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
    </div>
  );
}
