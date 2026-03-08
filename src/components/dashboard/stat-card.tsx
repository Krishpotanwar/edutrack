'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Color variants for icon backgrounds
const iconColorVariants = {
  primary: {
    bg: 'bg-gradient-to-br from-violet-500/20 to-purple-500/5',
    icon: 'text-violet-600 dark:text-violet-400',
  },
  purple: {
    bg: 'bg-gradient-to-br from-pink-500/20 to-rose-500/5',
    icon: 'text-pink-600 dark:text-pink-400',
  },
  blue: {
    bg: 'bg-gradient-to-br from-cyan-500/20 to-sky-500/5',
    icon: 'text-cyan-600 dark:text-cyan-400',
  },
  green: {
    bg: 'bg-gradient-to-br from-emerald-500/20 to-green-500/5',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-500/20 to-amber-500/5',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  rose: {
    bg: 'bg-gradient-to-br from-rose-500/20 to-rose-500/5',
    icon: 'text-rose-600 dark:text-rose-400',
  },
};

interface StatCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  colorVariant?: keyof typeof iconColorVariants;
  className?: string;
}

/**
 * StatCard component with number counting animation
 */
export function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  trend, 
  colorVariant = 'primary',
  className 
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseInt(value, 10);
  const isNumeric = typeof value === 'number' || !isNaN(numericValue);
  const colors = iconColorVariants[colorVariant];

  // Animate number counting with easing
  useEffect(() => {
    if (!isNumeric) {
      return;
    }

    let startTime: number;
    let animationFrameId: number;
    const duration = 1200;

    const easeOutExpo = (t: number): number => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      setDisplayValue(Math.floor(easedProgress * numericValue));

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
  }, [numericValue, isNumeric]);

  return (
    <motion.div
      className={cn('glass-card p-4 sm:p-6 relative overflow-hidden', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className={cn('p-2 sm:p-3 rounded-xl', colors.bg)}>
          <Icon className={cn('h-5 w-5 sm:h-6 sm:w-6', colors.icon)} />
        </div>
        
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              trend.positive
                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                : 'bg-red-500/10 text-red-600 dark:text-red-400'
            )}
          >
            <div>
              {trend.positive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
            </div>
            <span>{trend.positive ? '+' : ''}{trend.value}%</span>
          </div>
        )}
      </div>
      
      <div className="mt-3 sm:mt-4 relative z-10">
        <p className="text-2xl sm:text-3xl font-bold tabular-nums">
          {isNumeric ? displayValue.toLocaleString() : value}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {label}
        </p>
      </div>
    </motion.div>
  );
}
