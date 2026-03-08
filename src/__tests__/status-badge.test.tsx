import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/glass/status-badge';

describe('StatusBadge', () => {
  it('renders completed status with correct text', () => {
    render(<StatusBadge status="completed" />);

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders ongoing status with correct text', () => {
    render(<StatusBadge status="ongoing" />);

    expect(screen.getByText('Ongoing')).toBeInTheDocument();
  });

  it('renders planned status with correct text', () => {
    render(<StatusBadge status="planned" />);

    expect(screen.getByText('Planned')).toBeInTheDocument();
  });

  it('applies correct className for completed status', () => {
    const { container } = render(<StatusBadge status="completed" />);

    const badge = container.querySelector('span');
    expect(badge).toHaveClass('bg-green-500/20');
    expect(badge).toHaveClass('text-green-700');
  });

  it('applies correct className for ongoing status', () => {
    const { container } = render(<StatusBadge status="ongoing" />);

    const badge = container.querySelector('span');
    expect(badge).toHaveClass('bg-amber-500/20');
    expect(badge).toHaveClass('text-amber-700');
  });

  it('applies correct className for planned status', () => {
    const { container } = render(<StatusBadge status="planned" />);

    const badge = container.querySelector('span');
    expect(badge).toHaveClass('bg-blue-500/20');
    expect(badge).toHaveClass('text-blue-700');
  });

  it('accepts custom className', () => {
    const { container } = render(
      <StatusBadge status="completed" className="custom-class" />
    );

    const badge = container.querySelector('span');
    expect(badge).toHaveClass('custom-class');
  });

  it('has badge styling classes', () => {
    const { container } = render(<StatusBadge status="planned" />);

    const badge = container.querySelector('span');
    expect(badge).toHaveClass('inline-flex');
    expect(badge).toHaveClass('items-center');
    expect(badge).toHaveClass('px-2.5');
    expect(badge).toHaveClass('py-0.5');
    expect(badge).toHaveClass('rounded-full');
    expect(badge).toHaveClass('text-xs');
    expect(badge).toHaveClass('font-medium');
    expect(badge).toHaveClass('border');
  });
});
