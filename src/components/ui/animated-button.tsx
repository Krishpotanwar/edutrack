'use client';

import { forwardRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

// Ripple component for click effect
interface RippleData {
  id: number;
  x: number;
  y: number;
}

function Ripple({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <motion.span
      className="absolute rounded-full pointer-events-none"
      initial={{ width: 0, height: 0, x, y, opacity: 0.6 }}
      animate={{ 
        width: 200, 
        height: 200, 
        x: x - 100, 
        y: y - 100, 
        opacity: 0 
      }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ backgroundColor: color }}
    />
  );
}

const animatedButtonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        ghost: 'bg-transparent hover:bg-accent hover:text-accent-foreground',
        glow: 'bg-primary text-primary-foreground',
        gradient: 'text-white',
        outline: 'border-2 border-primary text-primary bg-transparent',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface AnimatedButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'>,
    VariantProps<typeof animatedButtonVariants> {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  rippleColor?: string;
}

/**
 * AnimatedButton component with stunning effects
 * Features: ripple effect on click, gradient background animation,
 * loading state with spinner, multiple variants (primary, secondary, ghost, glow, gradient)
 */
export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText,
      rippleColor,
      className,
      onClick,
      disabled,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<RippleData[]>([]);

    // Determine ripple color based on variant
    const getRippleColor = () => {
      if (rippleColor) return rippleColor;
      switch (variant) {
        case 'primary':
        case 'glow':
        case 'gradient':
          return 'rgba(255, 255, 255, 0.4)';
        case 'secondary':
          return 'rgba(0, 0, 0, 0.1)';
        case 'ghost':
        case 'outline':
          return 'color-mix(in oklch, var(--primary) 20%, transparent)';
        default:
          return 'rgba(255, 255, 255, 0.3)';
      }
    };

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (loading || disabled) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setRipples((prev) => [...prev, { id, x, y }]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);

        onClick?.(e);
      },
      [loading, disabled, onClick]
    );

    // Gradient animation for gradient variant
    const gradientStyle =
      variant === 'gradient'
        ? {
            background: 'linear-gradient(135deg, var(--primary) 0%, oklch(0.55 0.2 280) 50%, var(--primary) 100%)',
            backgroundSize: '200% 200%',
          }
        : {};

    // Glow effect styles
    const glowStyles =
      variant === 'glow'
        ? {
            boxShadow: '0 0 20px color-mix(in oklch, var(--primary) 50%, transparent), 0 0 40px color-mix(in oklch, var(--primary) 30%, transparent)',
          }
        : {};

    return (
      <motion.button
        ref={ref}
        className={cn(animatedButtonVariants({ variant, size }), className)}
        style={{ ...gradientStyle, ...glowStyles }}
        onClick={handleClick}
        disabled={disabled || loading}
        whileHover={{
          scale: 1.03,
          ...(variant === 'glow' && {
            boxShadow: '0 0 30px color-mix(in oklch, var(--primary) 60%, transparent), 0 0 60px color-mix(in oklch, var(--primary) 40%, transparent)',
          }),
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...props}
      >
        {/* Gradient animation overlay */}
        {variant === 'gradient' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, oklch(0.55 0.2 280) 50%, var(--primary) 100%)',
              backgroundSize: '200% 200%',
            }}
          />
        )}

        {/* Glow pulse animation */}
        {variant === 'glow' && (
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              background: 'radial-gradient(circle at center, color-mix(in oklch, var(--primary) 30%, transparent) 0%, transparent 70%)',
            }}
          />
        )}

        {/* Shimmer effect on hover for primary */}
        {(variant === 'primary' || variant === 'outline') && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ x: '-100%', opacity: 0 }}
            whileHover={{
              x: '200%',
              opacity: 0.2,
              transition: { duration: 0.6 },
            }}
            style={{
              background: 'linear-gradient(90deg, transparent, white, transparent)',
              width: '50%',
            }}
          />
        )}

        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <Ripple key={ripple.id} x={ripple.x} y={ripple.y} color={getRippleColor()} />
        ))}

        {/* Button content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.span
              key="loading"
              className="flex items-center gap-2 relative z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingText && <span>{loadingText}</span>}
            </motion.span>
          ) : (
            <motion.span
              key="content"
              className="flex items-center gap-2 relative z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

// Export variants for external use
export { animatedButtonVariants };
