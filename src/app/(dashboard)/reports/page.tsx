'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GlassCard, SkeletonChart } from '@/components/glass';
import { BarChartComponent, DonutChart } from '@/components/dashboard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarDays, Users, CheckCircle, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportsData {
  eventsPerMonth: Array<{ name: string; value: number }>;
  eventsByStatus: Array<{ name: string; value: number; color: string }>;
  volunteerParticipation: Array<{ name: string; value: number }>;
}

async function fetchReportsOverview(): Promise<ReportsData> {
  const response = await fetch('/api/reports/overview');
  if (!response.ok) throw new Error('Failed to fetch reports');
  return response.json();
}

export default function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['reports-overview'],
    queryFn: fetchReportsOverview,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const [detailPanel, setDetailPanel] = useState<{ title: string; label: string; value: string; subtitle?: string } | null>(null);

  // Compute summary stats from API data
  const totalEvents = useMemo(() => {
    if (!data?.eventsByStatus) return 0;
    return data.eventsByStatus.reduce((sum, s) => sum + s.value, 0);
  }, [data]);

  const totalParticipants = useMemo(() => {
    if (!data?.volunteerParticipation) return 0;
    return data.volunteerParticipation.reduce((sum, m) => sum + m.value, 0);
  }, [data]);

  const completionRate = useMemo(() => {
    if (!data?.eventsByStatus || totalEvents === 0) return 0;
    const completed = data.eventsByStatus.find(
      (s) => s.name.toLowerCase() === 'completed'
    );
    return Math.round(((completed?.value || 0) / totalEvents) * 100);
  }, [data, totalEvents]);

  const growthRate = useMemo(() => {
    if (!data?.eventsPerMonth || data.eventsPerMonth.length < 2) return 0;
    const months = data.eventsPerMonth;
    const current = months[months.length - 1].value;
    const previous = months[months.length - 2].value;
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  }, [data]);

  const handleLineClick = (pointData: { name?: string; value?: number }) => {
    if (pointData?.name && pointData?.value !== undefined) {
      setDetailPanel({
        title: 'Volunteer Participation',
        label: pointData.name,
        value: String(pointData.value),
        subtitle: `${pointData.value} volunteers in ${pointData.name}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Analytics and insights for your events</p>
      </div>

      {/* Summary Cards — computed from data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="text-center">
          <CalendarDays className="h-8 w-8 mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold">{isLoading ? '—' : totalEvents}</p>
          <p className="text-sm text-muted-foreground">Total Events</p>
        </GlassCard>
        <GlassCard className="text-center">
          <Users className="h-8 w-8 mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold">{isLoading ? '—' : totalParticipants}</p>
          <p className="text-sm text-muted-foreground">Total Participants</p>
        </GlassCard>
        <GlassCard className="text-center">
          <CheckCircle className="h-8 w-8 mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold">{isLoading ? '—' : `${completionRate}%`}</p>
          <p className="text-sm text-muted-foreground">Completion Rate</p>
        </GlassCard>
        <GlassCard className="text-center">
          <TrendingUp className="h-8 w-8 mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold">{isLoading ? '—' : `${growthRate >= 0 ? '+' : ''}${growthRate}%`}</p>
          <p className="text-sm text-muted-foreground">Growth Rate</p>
        </GlassCard>
      </div>

      {/* Charts */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonChart />
          <SkeletonChart />
          <SkeletonChart />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DonutChart
              title="Events by Status"
              data={data?.eventsByStatus || []}
            />
            <BarChartComponent
              title="Events per Month"
              data={data?.eventsPerMonth || []}
            />
          </div>

          {/* Volunteer Participation Line Chart */}
          <GlassCard className="p-4 sm:p-6 relative">
            <h3 className="font-semibold mb-4">Volunteer Participation</h3>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.volunteerParticipation || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <YAxis
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, cursor: 'pointer' }}
                    activeDot={{
                      r: 6,
                      cursor: 'pointer',
                      onClick: ((_: unknown, payload: unknown) => {
                        const p = payload as { payload?: { name: string; value: number } } | undefined;
                        if (p?.payload) handleLineClick(p.payload);
                      }) as never,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>

              {/* Detail overlay for line chart */}
              <AnimatePresence>
                {detailPanel && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute inset-0 flex items-center justify-center z-20"
                  >
                    <div
                      className="glass-card p-4 rounded-xl relative text-center min-w-[180px] shadow-2xl border border-white/20 dark:border-white/10"
                      style={{
                        background: 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(20px) saturate(1.5)',
                        WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
                      }}
                    >
                      <button
                        onClick={() => setDetailPanel(null)}
                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        aria-label="Close detail"
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <p className="text-sm font-medium text-muted-foreground">{detailPanel.label}</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{detailPanel.value}</p>
                      {detailPanel.subtitle && (
                        <p className="text-xs text-muted-foreground mt-1">{detailPanel.subtitle}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
}
