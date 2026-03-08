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
    glow: '#8B5CF6',
    icon: 'text-violet-600 dark:text-violet-400',
  },
  purple: {
    bg: 'bg-gradient-to-br from-pink-500/20 to-rose-500/5',
    glow: '#EC4899',
    icon: 'text-pink-600 dark:text-pink-400',
  },
  blue: {
    bg: 'bg-gradient-to-br from-cyan-500/20 to-sky-500/5',
    glow: '#06B6D4',
    icon: 'text-cyan-600 dark:text-cyan-400',
  },
  green: {
    bg: 'bg-gradient-to-br from-emerald-500/20 to-green-500/5',
    glow: '#10B981',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-500/20 to-amber-500/5',
    glow: '#F59E0B',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  rose: {
    bg: 'bg-gradient-to-br from-rose-500/20 to-rose-500/5',
    glow: '#F43F5E',
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
 * StatCard component with number counting animation and hover glow
 * Features: gradient icon backgrounds, hover glow matching icon color,
 * animated trend arrows, number counting animation
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
  const [isHovered, setIsHovered] = useState(false);
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

    // Easing function for smoother animation
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
      whileHover={{ 
        y: -6, 
        scale: 1.02,
        transition: { duration: 0.2, ease: 'easeOut' } 
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        boxShadow: isHovered 
          ? `0 20px 40px -10px ${colors.glow}40, 0 0 30px ${colors.glow}20`
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Background glow effect */}
      <motion.div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none"
        animate={{
          opacity: isHovered ? 0.3 : 0.1,
          scale: isHovered ? 1.2 : 1,
        }}
        transition={{ duration: 0.3 }}
        style={{
          background: `radial-gradient(circle, ${colors.glow}40 0%, transparent 70%)`,
        }}
      />
      
      <div className="flex items-start justify-between relative z-10">
        {/* Gradient icon background */}
        <motion.div 
          className={cn('p-2 sm:p-3 rounded-xl relative', colors.bg)}
          whileHover={{ scale: 1.15, rotate: 8 }}
          animate={{ 
            boxShadow: isHovered 
              ? `0 0 20px ${colors.glow}50, 0 0 40px ${colors.glow}20` 
              : 'none' 
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          {/* Inner glow */}
          <motion.div
            className="absolute inset-0 rounded-xl"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            style={{
              background: `radial-gradient(circle at center, ${colors.glow}30 0%, transparent 70%)`,
            }}
          />
          <Icon className={cn('h-5 w-5 sm:h-6 sm:w-6 relative z-10', colors.icon)} />
        </motion.div>
        
        {/* Trend badge with animated arrow */}
        {trend && (
          <motion.div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              trend.positive
                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                : 'bg-red-500/10 text-red-600 dark:text-red-400'
            )}
            initial={{ opacity: 0, scale: 0.8, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3, type: 'spring' }}
          >
            <motion.div
              animate={{ 
                y: trend.positive ? [0, -2, 0] : [0, 2, 0],
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                repeatType: 'loop',
                ease: 'easeInOut',
              }}
            >
              {trend.positive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
            </motion.div>
            <span>{trend.positive ? '+' : ''}{trend.value}%</span>
          </motion.div>
        )}
      </div>
      
      <div className="mt-3 sm:mt-4 relative z-10">
        <motion.p 
          className="text-2xl sm:text-3xl font-bold tabular-nums"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          {isNumeric ? displayValue.toLocaleString() : value}
        </motion.p>
        <motion.p 
          className="text-sm text-muted-foreground mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {label}
        </motion.p>
      </div>
    </motion.div>
  );
}
