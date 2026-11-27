import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import OrderDetailModal from './OrderDetailModal';
import type { Order } from './OrderMeta';
import { renderWithProviders } from '../../test/render';

const order: Order = {
  id: 'order-1',
  userId: 'u1',
  orderCode: 'ABC123',
  customerName: 'مشتری نمونه',
  customerPhone: '09120000000',
  customerAddress: 'تهران',
  addressId: 'a1',
  deliveryMethodId: null,
  deliveryPrice: 0,
  status: 'pending',
  paymentStatus: 'unpaid',
  paymentMethod: null,
  receiptImageUrl: null,
  rejectionReason: null,
  totalAmount: 1000,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  items: [],
};

describe('OrderDetailModal', () => {
  it('renders nothing when closed', () => {
    const { container } = renderWithProviders(
      <OrderDetailModal open={false} orderId={null} onClose={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the order details when open', () => {
    renderWithProviders(
      <OrderDetailModal open orderId="order-1" order={order} onClose={() => {}} />,
    );
    expect(screen.getByText('جزئیات سفارش')).toBeInTheDocument();
    expect(screen.getByText('مشتری نمونه')).toBeInTheDocument();
    expect(screen.getByText('کد: ABC123')).toBeInTheDocument();
  });
});