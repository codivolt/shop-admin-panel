import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import Card from './Card';

describe('Card', () => {
  it('renders children with default padding', () => {
    render(<Card>محتوا</Card>);
    expect(screen.getByText('محتوا')).toBeInTheDocument();
  });

  it('applies custom class names', () => {
    render(<Card className="custom-card">محتوا</Card>);
    expect(screen.getByText('محتوا')).toHaveClass('custom-card');
  });
});