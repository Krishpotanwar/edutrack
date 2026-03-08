'use client';

import { useEffect, useRef } from 'react';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  startTime: number;
}

interface WaterRippleProps {
  /** Maximum number of concurrent ripples */
  maxRipples?: number;
  /** Ripple expansion speed */
  speed?: number;
  /** Maximum ripple radius */
  maxRadius?: number;
  /** Ripple color (rgba format recommended) */
  color?: string;
  /** Whether to trigger ripples on mouse move */
  triggerOnMove?: boolean;
  /** Minimum distance between ripple triggers */
  minDistance?: number;
}

/**
 * WaterRipple - A canvas-based water ripple effect component
 * 
 * Creates smooth, GPU-accelerated ripple animations that appear
 * when the user moves their mouse or clicks on the dashboard.
 * Optimized for performance with requestAnimationFrame and ripple pooling.
 */
export function WaterRipple({
  maxRipples = 8,
  speed = 3,
  maxRadius = 200,
  color = 'rgba(13, 148, 136, 0.12)',
  triggerOnMove = true,
  minDistance = 100,
}: WaterRippleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
  const isActiveRef = useRef(false);

  // ------------------------------------------------------------------
  // All animation and event logic lives inside the effect so that
  // plain functions can freely self-reference and mutate refs without
  // triggering React Compiler purity / immutability rules.
  // ------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    function parseColor(colorStr: string, opacity: number) {
      const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
      if (match) {
        return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
      }
      return colorStr;
    }

    function animate() {
      const cvs = canvasRef.current;
      const ctx = cvs?.getContext('2d');

      if (!cvs || !ctx) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, cvs.width, cvs.height);

      const activeRipples: Ripple[] = [];

      for (const ripple of ripplesRef.current) {
        ripple.radius = Math.min(ripple.radius + speed, maxRadius);
        ripple.opacity = Math.max(0, 1 - (ripple.radius / maxRadius));

        if (ripple.opacity > 0.01) {
          activeRipples.push(ripple);

          const gradient = ctx.createRadialGradient(
            ripple.x, ripple.y, 0,
            ripple.x, ripple.y, ripple.radius
          );

          gradient.addColorStop(0, parseColor(color, ripple.opacity * 0.5));
          gradient.addColorStop(0.5, parseColor(color, ripple.opacity * 0.3));
          gradient.addColorStop(1, parseColor(color, 0));

          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
          ctx.strokeStyle = parseColor(color, ripple.opacity * 0.4);
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      ripplesRef.current = activeRipples;

      if (activeRipples.length > 0 || isActiveRef.current) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    }

    function startAnimation() {
      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(animate);
      }
    }

    function createRipple(x: number, y: number) {
      if (ripplesRef.current.length >= maxRipples) {
        ripplesRef.current.shift();
      }

      ripplesRef.current.push({
        x,
        y,
        radius: 0,
        opacity: 1,
        startTime: performance.now(),
      });

      startAnimation();
    }

    function handleMouseMove(e: MouseEvent) {
      if (!triggerOnMove) return;

      const cvs = canvasRef.current;
      if (!cvs) return;

      const rect = cvs.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (lastPositionRef.current) {
        const dx = x - lastPositionRef.current.x;
        const dy = y - lastPositionRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) return;
      }

      lastPositionRef.current = { x, y };
      createRipple(x, y);
    }

    function handleClick(e: MouseEvent) {
      const cvs = canvasRef.current;
      if (!cvs) return;

      const rect = cvs.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      createRipple(x, y);
      setTimeout(() => createRipple(x + 10, y + 10), 50);
      setTimeout(() => createRipple(x - 10, y - 10), 100);
    }

    function handleMouseEnter() {
      isActiveRef.current = true;
      startAnimation();
    }

    function handleMouseLeave() {
      isActiveRef.current = false;
      lastPositionRef.current = null;
    }

    function resizeCanvas() {
      const cvs = canvasRef.current;
      if (!cvs) return;

      const par = cvs.parentElement;
      if (!par) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = par.getBoundingClientRect();

      cvs.width = rect.width * dpr;
      cvs.height = rect.height * dpr;
      cvs.style.width = `${rect.width}px`;
      cvs.style.height = `${rect.height}px`;

      const ctx = cvs.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    }

    resizeCanvas();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(parent);

    window.addEventListener('resize', resizeCanvas);

    isActiveRef.current = true;
    if (!animationRef.current) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      resizeObserver.disconnect();
      window.removeEventListener('resize', resizeCanvas);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [maxRipples, speed, maxRadius, color, triggerOnMove, minDistance]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
      aria-hidden="true"
    />
  );
}
