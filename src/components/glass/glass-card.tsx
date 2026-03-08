'use client';

import { cn } from '@/lib/utils';
import { forwardRef, useState } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'subtle';
  hover?: boolean;
  glow?: boolean;
  glowColor?: string;
  className?: string;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, variant = 'default', hover = true, glow = false, glowColor = 'var(--primary)', className, ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const variants = {
      default: 'glass-card',
      elevated: 'glass-card shadow-lg',
      subtle: 'glass-card bg-opacity-50',
    };

    const shouldGlow = glow || (hover && isHovered);

    return (
      <motion.div
        ref={ref}
        className={cn(
          variants[variant],
          'p-6 relative overflow-hidden',
          'transition-all duration-300 ease-out',
          className
        )}
        style={{
          boxShadow: shouldGlow 
            ? `0 0 20px ${glowColor}40, 0 0 40px ${glowColor}20, 0 8px 32px rgba(0,0,0,0.12)`
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          borderColor: shouldGlow ? `${glowColor}60` : undefined,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={hover ? { 
          y: -4, 
          scale: 1.02, 
          transition: { duration: 0.2, ease: 'easeOut' } 
        } : undefined}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        {...props}
      >
        {/* Gradient border effect */}
        {shouldGlow && (
          <motion.div
            className="absolute inset-0 rounded-[inherit] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: `linear-gradient(135deg, ${glowColor}30 0%, transparent 50%, ${glowColor}20 100%)`,
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'xor',
              WebkitMaskComposite: 'xor',
              padding: '1px',
            }}
          />
        )}
        
        {/* Shimmer effect on hover */}
        {hover && isHovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '200%', opacity: 0.1 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{
              background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)`,
              width: '50%',
            }}
          />
        )}
        
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
