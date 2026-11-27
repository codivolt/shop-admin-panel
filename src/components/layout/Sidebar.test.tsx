import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import Sidebar from './Sidebar';
import { renderWithProviders } from '../../test/render';

describe('Sidebar', () => {
  it('renders the navigation groups when open', () => {
    const { container } = renderWithProviders(<Sidebar open onClose={() => {}} />, {
      route: '/products',
    });
    expect(screen.getByRole('button', { name: 'بستن منو' })).toBeInTheDocument();
    expect(container.querySelector('nav.sidebar-nav')).toBeInTheDocument();
  });

  it('renders the close control when closed', () => {
    renderWithProviders(<Sidebar open={false} onClose={() => {}} />);
    expect(screen.getByRole('button', { name: 'بستن منو' })).toBeInTheDocument();
  });
});