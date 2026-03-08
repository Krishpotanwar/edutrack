import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

vi.mock('recharts', () => ({
  PieChart: ({ children }: { children?: ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  ResponsiveContainer: ({ children }: { children?: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Legend: () => <div data-testid="legend" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Sector: () => <div data-testid="sector" />,
}));

import { DonutChart } from '@/components/dashboard/donut-chart';

describe('DonutChart', () => {
  const sampleData = [
    { name: 'Planned', value: 10, color: '#3B82F6' },
    { name: 'Ongoing', value: 5, color: '#F59E0B' },
    { name: 'Completed', value: 20, color: '#10B981' },
  ];

  it('renders with title', () => {
    render(<DonutChart data={sampleData} title="Events by Status" />);
    expect(screen.getByText('Events by Status')).toBeInTheDocument();
  });

  it('renders chart container', () => {
    render(<DonutChart data={sampleData} title="Status Chart" />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('handles empty data array', () => {
    render(<DonutChart data={[]} title="Empty Donut" />);
    expect(screen.getByText('Empty Donut')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <DonutChart data={sampleData} title="Custom" className="my-donut" />
    );
    expect(container.querySelector('.my-donut')).toBeInTheDocument();
  });

  it('renders with glass-card styling', () => {
    const { container } = render(
      <DonutChart data={sampleData} title="Glass Donut" />
    );
    expect(container.querySelector('.glass-card')).toBeInTheDocument();
  });

  it('renders with single data point', () => {
    render(
      <DonutChart data={[{ name: 'Only', value: 100, color: '#000' }]} title="Single" />
    );
    expect(screen.getByText('Single')).toBeInTheDocument();
  });
});
