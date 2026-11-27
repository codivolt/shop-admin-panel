import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import StatCard from './StatCard';

describe('StatCard', () => {
  it('renders label, hint and a string value', () => {
    render(<StatCard label="فروش" value="۱۲۳" icon={<span>i</span>} hint="این هفته" />);
    expect(screen.getByText('فروش')).toBeInTheDocument();
    expect(screen.getByText('۱۲۳')).toBeInTheDocument();
    expect(screen.getByText('این هفته')).toBeInTheDocument();
  });

  it('formats numeric values with Persian digits', () => {
    render(<StatCard label="تعداد" value={1234} icon={<span>i</span>} />);
    expect(screen.getByText('۱٬۲۳۴')).toBeInTheDocument();
  });
});