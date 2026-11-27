import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import AccessDenied from './AccessDenied';

describe('AccessDenied', () => {
  it('mentions the resource in both messages', () => {
    render(<AccessDenied resource="سفارشات" />);
    expect(screen.getByText('عدم دسترسی به مشاهده سفارشات')).toBeInTheDocument();
    expect(screen.getByText('شما دسترسی مشاهده لیست سفارشات را ندارید.')).toBeInTheDocument();
  });
});