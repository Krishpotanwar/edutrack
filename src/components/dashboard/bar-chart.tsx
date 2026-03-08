'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BarChartComponentProps {
  data: Array<{ name: string; value: number }>;
  title: string;
  className?: string;
  color?: string;
  onClick?: (data: { name: string; value: number }) => void;
}

interface BarTooltipPayloadItem {
  value: number;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: BarTooltipPayloadItem[]; label?: string }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      className="relative overflow-hidden rounded-xl px-4 py-3 shadow-2xl border border-border"
      style={{
        background: 'var(--glass-bg-strong)',
        backdropFilter: 'blur(20px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-pink-500/5 pointer-events-none" />
      <p className="text-xs font-medium text-muted-foreground mb-1 relative z-10">{label}</p>
      <p className="text-lg font-bold text-foreground relative z-10">
        {payload[0].value}
        <span className="text-xs font-normal text-muted-foreground ml-1">events</span>
      </p>
    </div>
  );
}

export function BarChartComponent({ data, title, className, onClick }: BarChartComponentProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedBar, setSelectedBar] = useState<{ name: string; value: number } | null>(null);

  const handleBarClick = (entry: { name: string; value: number }) => {
    setSelectedBar(entry);
    onClick?.(entry);
  };

  return (
    <div className={cn('glass-card p-4 sm:p-6 relative', className)}>
      <h3 className="font-semibold mb-4 text-foreground">{title}</h3>
      <div className="h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            onMouseLeave={() => setActiveIndex(null)}
            margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="barGradientActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A78BFA" stopOpacity={1} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.8} />
              </linearGradient>
              <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#8B5CF6" floodOpacity="0.3" />
              </filter>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              strokeOpacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--accent)', opacity: 0.3 }} />
            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onClick={((barData: { name?: string; value?: number }) => handleBarClick({ name: String(barData.name ?? ''), value: Number(barData.value ?? 0) })) as never}
              animationDuration={1200}
              animationEasing="ease-out"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={activeIndex === index ? 'url(#barGradientActive)' : 'url(#barGradient)'}
                  filter={activeIndex === index ? 'url(#barShadow)' : 'none'}
                  style={{
                    transition: 'all 0.3s ease',
                    transform: activeIndex === index ? 'scaleY(1.02)' : 'scaleY(1)',
                    transformOrigin: 'bottom',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Drill-down detail overlay */}
        <AnimatePresence>
          {selectedBar && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center z-20"
            >
              <div
                className="glass-card p-4 rounded-xl relative text-center min-w-[180px] shadow-2xl border border-border"
                style={{
                  background: 'var(--glass-bg-strong)',
                  backdropFilter: 'blur(20px) saturate(1.5)',
                  WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
                }}
              >
                <button
                  onClick={() => setSelectedBar(null)}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  aria-label="Close detail"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <p className="text-sm font-medium text-muted-foreground">{selectedBar.name}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{selectedBar.value}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedBar.value} events in {selectedBar.name}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
