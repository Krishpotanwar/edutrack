'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StaggeredListProps {
  children: ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
}

interface StaggeredListItemProps {
  children: ReactNode;
  className?: string;
  index?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: (props: { delayChildren?: number; staggerChildren?: number }) => ({
    opacity: 1,
    transition: {
      staggerChildren: props.staggerChildren || 0.12,
      delayChildren: props.delayChildren || 0.2,
    },
  }),
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.92,
    filter: 'blur(6px)',
    rotateY: 3,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    rotateY: 0,
  },
};

/**
 * StaggeredList component
 * Wraps a list of items and animates them with staggered entry
 * Use StaggeredListItem as children for consistent animation
 */
export function StaggeredList({
  children,
  staggerDelay = 0.12,
  delayChildren = 0.2,
  className = '',
}: StaggeredListProps) {
  return (
    <motion.div
      custom={{ staggerChildren: staggerDelay, delayChildren }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggeredListItem component
 * Individual list item that animates within a StaggeredList
 */
export function StaggeredListItem({ children, className = '' }: StaggeredListItemProps) {
  return (
    <motion.div 
      variants={itemVariants} 
      transition={{ 
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
