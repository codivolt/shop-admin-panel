import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  OrderStatusBadge,
  PaymentStatusBadge,
  shortOrderId,
} from './OrderMeta';

describe('OrderMeta', () => {
  it('shortens order ids to 8 uppercase characters', () => {
    expect(shortOrderId('abcdef1234567890')).toBe('ABCDEF12');
  });

  it('renders the order status label', () => {
    render(<OrderStatusBadge status="shipped" />);
    expect(screen.getByText(ORDER_STATUS.shipped.label)).toBeInTheDocument();
  });

  it('renders the payment status label', () => {
    render(<PaymentStatusBadge status="paid" />);
    expect(screen.getByText(PAYMENT_STATUS.paid.label)).toBeInTheDocument();
  });

  it('falls back to pending/unpaid for unknown statuses', () => {
    render(<OrderStatusBadge status={'unknown' as never} />);
    expect(screen.getByText(ORDER_STATUS.pending.label)).toBeInTheDocument();
  });
});