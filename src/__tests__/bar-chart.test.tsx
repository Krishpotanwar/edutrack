import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

vi.mock('recharts', () => ({
  BarChart: ({ children }: { children?: ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="xaxis" />,
  YAxis: () => <div data-testid="yaxis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children?: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
}));

import { BarChartComponent } from '@/components/dashboard/bar-chart';

describe('BarChartComponent', () => {
  const sampleData = [
    { name: 'Jan', value: 10 },
    { name: 'Feb', value: 20 },
    { name: 'Mar', value: 15 },
  ];

  it('renders with title', () => {
    render(<BarChartComponent data={sampleData} title="Events per Month" />);
    expect(screen.getByText('Events per Month')).toBeInTheDocument();
  });

  it('renders chart container', () => {
    render(<BarChartComponent data={sampleData} title="Test Chart" />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders with empty data array', () => {
    render(<BarChartComponent data={[]} title="Empty Chart" />);
    expect(screen.getByText('Empty Chart')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <BarChartComponent data={sampleData} title="Styled" className="custom-chart" />
    );
    expect(container.querySelector('.custom-chart')).toBeInTheDocument();
  });

  it('renders with glass-card styling', () => {
    const { container } = render(
      <BarChartComponent data={sampleData} title="Glass" />
    );
    expect(container.querySelector('.glass-card')).toBeInTheDocument();
  });

  it('renders a single data point', () => {
    render(<BarChartComponent data={[{ name: 'Solo', value: 42 }]} title="Single" />);
    expect(screen.getByText('Single')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });
});
