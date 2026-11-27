import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import Breadcrumb from './Breadcrumb';
import { renderWithProviders } from '../../test/render';

describe('Breadcrumb', () => {
  it('renders the provided trail', () => {
    renderWithProviders(
      <Breadcrumb items={[{ label: 'محصولات', to: '/products' }, { label: 'افزودن' }]} />,
    );
    expect(screen.getByRole('navigation', { name: 'مسیر صفحه' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'محصولات' })).toHaveAttribute('href', '/products');
    expect(screen.getByText('افزودن')).toHaveAttribute('aria-current', 'page');
  });

  it('falls back to the auto trail for the current path', () => {
    renderWithProviders(<Breadcrumb />, { route: '/products/add' });
    expect(screen.getByText('افزودن محصول')).toBeInTheDocument();
  });
});