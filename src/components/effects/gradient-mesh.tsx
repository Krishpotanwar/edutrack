'use client';

import { motion } from 'framer-motion';

export function GradientMesh() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Bottom-left warm glow */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.15] dark:opacity-[0.10]"
        style={{
          background: 'radial-gradient(ellipse at 30% 70%, #EC4899 0%, #F97316 40%, transparent 70%)',
          bottom: '-20%',
          left: '-15%',
          filter: 'blur(40px)',
          willChange: 'transform',
        }}
        animate={{
          scale: [1, 1.05, 0.97, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Top-right cool glow */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.12] dark:opacity-[0.08]"
        style={{
          background: 'radial-gradient(ellipse at 70% 30%, #8B5CF6 0%, #3B82F6 40%, transparent 70%)',
          top: '-15%',
          right: '-10%',
          filter: 'blur(40px)',
          willChange: 'transform',
        }}
        animate={{
          scale: [1, 0.97, 1.05, 1],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Center subtle accent */}
      <motion.div
        className="absolute w-[400px] h-[250px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse, #06B6D4 0%, transparent 70%)',
          bottom: '10%',
          left: '25%',
          filter: 'blur(30px)',
          willChange: 'transform',
        }}
        animate={{
          opacity: [0.12, 0.15, 0.10, 0.12],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}
