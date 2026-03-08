'use client';

import { motion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 60,
    scale: 0.96,
    filter: 'blur(12px)',
    rotateX: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    rotateX: 0,
  },
  exit: {
    opacity: 0,
    y: -30,
    scale: 0.97,
    filter: 'blur(8px)',
    rotateX: -4,
  },
};

const pageVariantsReduced = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Sync initial value from external media query
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={prefersReducedMotion ? pageVariantsReduced : pageVariants}
      transition={{
        duration: prefersReducedMotion ? 0.15 : 0.9,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ perspective: '1000px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
