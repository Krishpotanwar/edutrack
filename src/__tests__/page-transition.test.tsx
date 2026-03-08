import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('framer-motion', () => {
  const MOTION_PROPS = new Set(['initial', 'animate', 'exit', 'variants', 'transition', 'whileHover', 'whileTap', 'layoutId', 'layout']);
  return {
    motion: new Proxy(
      {},
      {
        get: (_target, tag) => {
          return (props: Record<string, unknown>) => {
            const domProps: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(props)) {
              if (key !== 'children' && !MOTION_PROPS.has(key)) domProps[key] = value;
            }
            return React.createElement(typeof tag === 'string' ? tag : 'div', domProps, props.children);
          };
        },
      }
    ),
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
  };
});

import { PageTransition } from '@/components/animations/page-transition';

describe('PageTransition', () => {
  it('renders children', () => {
    render(
      <PageTransition>
        <div>Page Content</div>
      </PageTransition>
    );
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <PageTransition>
        <h1>Title</h1>
        <p>Paragraph</p>
      </PageTransition>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <PageTransition className="my-page">
        <div>Content</div>
      </PageTransition>
    );
    expect(container.querySelector('.my-page')).toBeInTheDocument();
  });

  it('wraps children in a motion div', () => {
    const { container } = render(
      <PageTransition>
        <span>Wrapped</span>
      </PageTransition>
    );
    // The motion.div mock renders a <div>, so children should be inside a div
    const wrapper = container.firstChild;
    expect(wrapper).toBeTruthy();
    expect(wrapper?.nodeName).toBe('DIV');
    expect(screen.getByText('Wrapped')).toBeInTheDocument();
  });

  it('applies perspective style', () => {
    const { container } = render(
      <PageTransition>
        <div>Styled</div>
      </PageTransition>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.perspective).toBe('1000px');
  });
});
