import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlassCard } from '@/components/glass/glass-card';

describe('GlassCard', () => {
  it('renders children correctly', () => {
    render(
      <GlassCard>
        <div>Test Content</div>
      </GlassCard>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    const { container } = render(
      <GlassCard>
        <div>Content</div>
      </GlassCard>
    );

    const card = container.querySelector('.glass-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('p-6');
  });

  it('renders with elevated variant', () => {
    const { container } = render(
      <GlassCard variant="elevated">
        <div>Elevated Content</div>
      </GlassCard>
    );

    const card = container.querySelector('.glass-card');
    expect(card).toHaveClass('shadow-lg');
  });

  it('renders with subtle variant', () => {
    const { container } = render(
      <GlassCard variant="subtle">
        <div>Subtle Content</div>
      </GlassCard>
    );

    const card = container.querySelector('.glass-card');
    expect(card).toHaveClass('bg-opacity-50');
  });

  it('accepts custom className', () => {
    const { container } = render(
      <GlassCard className="custom-class">
        <div>Content</div>
      </GlassCard>
    );

    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <GlassCard>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </GlassCard>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });
});
