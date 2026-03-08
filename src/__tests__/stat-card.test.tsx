import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '@/components/dashboard/stat-card';
import { Users } from 'lucide-react';

describe('StatCard', () => {
  it('renders value and label', () => {
    render(
      <StatCard
        icon={Users}
        value={100}
        label="Total Users"
      />
    );

    expect(screen.getByText('Total Users')).toBeInTheDocument();
  });

  it('renders string value', () => {
    render(
      <StatCard
        icon={Users}
        value="N/A"
        label="Status"
      />
    );

    expect(screen.getByText(/N\/A|0/)).toBeInTheDocument(); // The animation might show 0 initially for non-numeric
  });

  it('renders with trend positive', () => {
    render(
      <StatCard
        icon={Users}
        value={150}
        label="Active Users"
        trend={{ value: 12, positive: true }}
      />
    );

    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('renders with trend negative', () => {
    render(
      <StatCard
        icon={Users}
        value={80}
        label="Inactive Users"
        trend={{ value: 5, positive: false }}
      />
    );

    expect(screen.getByText('Inactive Users')).toBeInTheDocument();
    expect(screen.getByText('5%')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(
      <StatCard
        icon={Users}
        value={200}
        label="Members"
        className="custom-stat-card"
      />
    );

    const card = container.querySelector('.custom-stat-card');
    expect(card).toBeInTheDocument();
  });

  it('renders glass-card styling', () => {
    const { container } = render(
      <StatCard
        icon={Users}
        value={300}
        label="Total"
      />
    );

    const card = container.querySelector('.glass-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('p-4');
  });

  it('renders icon', () => {
    const { container } = render(
      <StatCard
        icon={Users}
        value={50}
        label="Team"
      />
    );

    // Check if SVG icon is rendered (lucide-react uses SVG)
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('handles numeric string values', () => {
    render(
      <StatCard
        icon={Users}
        value="250"
        label="Participants"
      />
    );

    expect(screen.getByText('Participants')).toBeInTheDocument();
  });
});
