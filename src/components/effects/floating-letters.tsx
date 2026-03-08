'use client';

import { useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// Letter sets from multiple Indian languages + English
// ---------------------------------------------------------------------------
const LETTER_SETS: Record<string, string[]> = {
  hindi:
    'अ आ इ ई उ ऊ ए ऐ ओ औ क ख ग घ च छ ज झ ट ठ ड ढ ण त थ द ध न प फ ब भ म य र ल व श ष स ह'.split(
      ' ',
    ),
  english:
    'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z'.split(' '),
  tamil:
    'அ ஆ இ ஈ உ ஊ எ ஏ ஐ ஒ ஓ ஔ க ங ச ஞ ட ண த ந ப ம'.split(' '),
  telugu:
    'అ ఆ ఇ ఈ ఉ ఊ ఎ ఏ ఐ ఒ ఓ ఔ క ఖ గ ఘ చ ఛ జ ఝ'.split(' '),
  bengali:
    'অ আ ই ঈ উ ঊ এ ঐ ও ঔ ক খ গ ঘ চ ছ জ ঝ ট ঠ'.split(' '),
  kannada:
    'ಅ ಆ ಇ ಈ ಉ ಊ ಎ ಏ ಐ ಒ ಓ ಔ ಕ ಖ ಗ ಘ ಚ ಛ'.split(' '),
  malayalam:
    'അ ആ ഇ ഈ ഉ ഊ എ ഏ ഐ ഒ ഓ ഔ ക ഖ ഗ ഘ ച ഛ'.split(' '),
  gujarati:
    'અ આ ઇ ઈ ઉ ઊ એ ઐ ઓ ઔ ક ખ ગ ઘ ચ છ જ ઝ'.split(' '),
};

// Cumulative weights for weighted random language selection
// Hindi 25%, English 20%, Tamil 10%, Telugu 10%, Bengali 10%, Kannada 10%, Malayalam 10%, Gujarati 5%
const LANGUAGE_KEYS = Object.keys(LETTER_SETS);
const LANGUAGE_WEIGHTS = [25, 20, 10, 10, 10, 10, 10, 5];
const CUMULATIVE_WEIGHTS = LANGUAGE_WEIGHTS.reduce<number[]>((acc, w) => {
  acc.push((acc.length > 0 ? acc[acc.length - 1] : 0) + w);
  return acc;
}, []);
const TOTAL_WEIGHT = CUMULATIVE_WEIGHTS[CUMULATIVE_WEIGHTS.length - 1];

// Soft, muted colour palette matching the purple/pink/cyan theme
const COLORS = [
  'rgba(139, 92, 246, 0.45)', // purple
  'rgba(225, 29, 72, 0.35)',  // coral
  'rgba(217, 119, 6, 0.4)',   // gold
  'rgba(5, 150, 105, 0.4)',   // emerald
  'rgba(37, 99, 235, 0.35)',  // blue accent
];

// Multi-script font stack so Indic characters render correctly
const FONT_FAMILY =
  "'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans Telugu', 'Noto Sans Bengali', 'Noto Sans Kannada', 'Noto Sans Malayalam', 'Noto Sans Gujarati', system-ui, sans-serif";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface LetterParticle {
  x: number;
  y: number;
  char: string;
  fontSize: number;
  color: string;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  vx: number;
  vy: number;
  life: number;
  birthTime: number;
  wobbleOffset: number;
}

interface FloatingLettersProps {
  /** Maximum concurrent letters on screen */
  maxLetters?: number;
  /** How often new letters spawn (ms) */
  spawnRate?: number;
  /** Minimum mouse distance to trigger a new letter (px) */
  minDistance?: number;
  /** Letter size range [min, max] in px */
  sizeRange?: [number, number];
  /** Letter lifetime in ms */
  lifetime?: number;
  /** Whether the effect is active */
  enabled?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * FloatingLetters – canvas-based floating alphabet effect.
 *
 * Letters from multiple Indian languages and English spawn near the cursor,
 * float upward with a gentle wobble and rotation, then fade out.
 * Fully GPU-accelerated, pointer-events-none, and respects prefers-reduced-motion.
 */
export function FloatingLetters({
  maxLetters = 12,
  spawnRate = 200,
  minDistance = 30,
  sizeRange = [14, 28],
  lifetime = 3000,
  enabled = true,
}: FloatingLettersProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<LetterParticle[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const mouseActiveRef = useRef(false);

  // ------------------------------------------------------------------
  // All animation and event logic lives inside the effect so that
  // plain functions can freely self-reference and mutate refs without
  // triggering React Compiler purity / immutability rules.
  // ------------------------------------------------------------------
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = mq.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
    };
    mq.addEventListener('change', onMotionChange);

    if (!enabled || reducedMotion) {
      return () => mq.removeEventListener('change', onMotionChange);
    }

    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    // --- Helpers (closures over props) ---

    function getRandomLetter(): string {
      const r = Math.random() * TOTAL_WEIGHT;
      let langIdx = 0;
      for (let i = 0; i < CUMULATIVE_WEIGHTS.length; i++) {
        if (r < CUMULATIVE_WEIGHTS[i]) {
          langIdx = i;
          break;
        }
      }
      const letters = LETTER_SETS[LANGUAGE_KEYS[langIdx]];
      return pick(letters);
    }

    function spawnLetter(x: number, y: number) {
      if (particlesRef.current.length >= maxLetters) {
        particlesRef.current.shift();
      }

      const fontSize = rand(sizeRange[0], sizeRange[1]);

      particlesRef.current.push({
        x: x + rand(-20, 20),
        y: y + rand(-20, 20),
        char: getRandomLetter(),
        fontSize,
        color: pick(COLORS),
        opacity: rand(0.5, 0.9),
        rotation: rand(-0.4, 0.4),
        rotationSpeed: rand(-0.035, 0.035),
        vx: rand(-0.3, 0.3),
        vy: rand(-1.5, -0.5),
        life: 1,
        birthTime: performance.now(),
        wobbleOffset: rand(0, Math.PI * 2),
      });
    }

    function animate(now: number) {
      const cvs = canvasRef.current;
      const ctx = cvs?.getContext('2d');
      if (!cvs || !ctx) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, cvs.width, cvs.height);

      const dpr = window.devicePixelRatio || 1;
      const alive: LetterParticle[] = [];

      for (const p of particlesRef.current) {
        const elapsed = (now - p.birthTime) / lifetime;
        p.life = Math.max(0, 1 - elapsed);

        if (p.life <= 0) continue;

        p.x += p.vx + Math.sin(now * 0.002 + p.wobbleOffset) * 0.25;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        const currentOpacity = p.opacity * p.life;
        const scale = 0.6 + 0.4 * p.life;
        const drawSize = p.fontSize * scale;

        ctx.save();
        ctx.translate(p.x * dpr, p.y * dpr);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = currentOpacity;
        ctx.font = `${drawSize * dpr}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = p.color;
        ctx.fillText(p.char, 0, 0);
        ctx.restore();

        alive.push(p);
      }

      particlesRef.current = alive;

      if (alive.length > 0 || mouseActiveRef.current) {
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

    function handleMouseMove(e: MouseEvent) {
      const cvs = canvasRef.current;
      if (!cvs) return;

      const rect = cvs.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (lastPosRef.current) {
        const dx = x - lastPosRef.current.x;
        const dy = y - lastPosRef.current.y;
        if (Math.sqrt(dx * dx + dy * dy) < minDistance) return;
      }

      const now = performance.now();
      if (now - lastSpawnRef.current < spawnRate) return;
      lastSpawnRef.current = now;

      lastPosRef.current = { x, y };
      spawnLetter(x, y);
      startAnimation();
    }

    function handleMouseEnter() {
      mouseActiveRef.current = true;
      startAnimation();
    }

    function handleMouseLeave() {
      mouseActiveRef.current = false;
      lastPosRef.current = null;
    }

    function resizeCanvas() {
      const cvs = canvasRef.current;
      const par = cvs?.parentElement;
      if (!cvs || !par) return;

      const dpr = window.devicePixelRatio || 1;
      const { width, height } = par.getBoundingClientRect();

      cvs.width = width * dpr;
      cvs.height = height * dpr;
      cvs.style.width = `${width}px`;
      cvs.style.height = `${height}px`;
    }

    resizeCanvas();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(parent);
    window.addEventListener('resize', resizeCanvas);

    mouseActiveRef.current = true;
    if (!animationRef.current) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      resizeObserver.disconnect();
      window.removeEventListener('resize', resizeCanvas);
      mq.removeEventListener('change', onMotionChange);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [enabled, maxLetters, sizeRange, minDistance, spawnRate, lifetime]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-[5]"
      style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      aria-hidden="true"
    />
  );
}
