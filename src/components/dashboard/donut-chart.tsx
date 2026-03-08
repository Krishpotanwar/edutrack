'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts';
import { cn } from '@/lib/utils';
import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface DonutChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  title: string;
  className?: string;
  onClick?: (data: { name: string; value: number; color: string; percent: number }) => void;
}

const CHART_COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#06B6D4', '#3B82F6', '#10B981'];

interface ActiveShapeProps {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: { name: string; value: number; color: string };
  percent: number;
  value: number;
}

const renderActiveShape = (props: ActiveShapeProps) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 12}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.2}
        style={{ filter: 'blur(8px)' }}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth={2}
      />
      <text x={cx} y={cy - 8} textAnchor="middle" fill="var(--foreground)" fontSize={16} fontWeight={700}>
        {value}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 28} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
};

interface DonutTooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  payload: { name: string; value: number; color: string };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: DonutTooltipPayloadItem[] }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      className="relative overflow-hidden rounded-xl px-4 py-3 shadow-2xl border border-white/20 dark:border-white/10"
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
      }}
    >
      <div className="flex items-center gap-2 relative z-10">
        <div className="w-3 h-3 rounded-full" style={{ background: payload[0].payload.color || payload[0].color }} />
        <span className="text-sm font-medium text-foreground">{payload[0].name}</span>
      </div>
      <p className="text-lg font-bold text-foreground mt-1 relative z-10">
        {payload[0].value}
        <span className="text-xs font-normal text-muted-foreground ml-1">events</span>
      </p>
    </div>
  );
}

export function DonutChart({ data, title, className, onClick }: DonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [selectedSlice, setSelectedSlice] = useState<{ name: string; value: number; color: string; percent: number } | null>(null);

  const onPieEnter = useCallback((_: unknown, index: number) => {
    setActiveIndex(index);
  }, []);

  const coloredData = useMemo(() => data.map((item, i) => ({
    ...item,
    color: CHART_COLORS[i % CHART_COLORS.length],
  })), [data]);

  const total = useMemo(() => coloredData.reduce((sum, d) => sum + d.value, 0), [coloredData]);

  const handleSliceClick = (_: unknown, index: number) => {
    const entry = coloredData[index];
    const percent = total > 0 ? (entry.value / total) * 100 : 0;
    const detail = { name: entry.name, value: entry.value, color: entry.color, percent };
    setSelectedSlice(detail);
    onClick?.(detail);
  };

  return (
    <div className={cn('glass-card p-4 sm:p-6 relative', className)}>
      <h3 className="font-semibold mb-4 text-foreground">{title}</h3>
      <div className="h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              {...({ activeIndex, activeShape: renderActiveShape } as Record<string, unknown>)}
              data={coloredData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onClick={handleSliceClick}
              animationDuration={1200}
              animationEasing="ease-out"
              stroke="none"
            >
              {coloredData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  style={{
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => (
                <span className="text-xs text-muted-foreground font-medium">{value}</span>
              )}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Drill-down detail overlay */}
        <AnimatePresence>
          {selectedSlice && (
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
                  onClick={() => setSelectedSlice(null)}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  aria-label="Close detail"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ background: selectedSlice.color }} />
                  <p className="text-sm font-medium text-muted-foreground">{selectedSlice.name}</p>
                </div>
                <p className="text-3xl font-bold text-foreground">{selectedSlice.value}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedSlice.percent.toFixed(1)}% of total
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
