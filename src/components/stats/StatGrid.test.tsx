import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import StatGrid from './StatGrid';

describe('StatGrid', () => {
  it('renders children', () => {
    render(
      <StatGrid>
        <div>کارت ۱</div>
        <div>کارت ۲</div>
      </StatGrid>,
    );
    expect(screen.getByText('کارت ۱')).toBeInTheDocument();
    expect(screen.getByText('کارت ۲')).toBeInTheDocument();
  });

  it('applies the requested column count', () => {
    render(
      <StatGrid cols={4}>
        <div>کارت</div>
      </StatGrid>,
    );
    expect(screen.getByText('کارت').parentElement).toHaveClass('lg:grid-cols-4');
  });
});