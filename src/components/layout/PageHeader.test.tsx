import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import PageHeader from './PageHeader';
import { renderWithProviders } from '../../test/render';

describe('PageHeader', () => {
  it('renders title and description', () => {
    renderWithProviders(<PageHeader title="محصولات" description="مدیریت محصولات" />);
    expect(screen.getByRole('heading', { name: 'محصولات' })).toBeInTheDocument();
    expect(screen.getByText('مدیریت محصولات')).toBeInTheDocument();
  });

  it('renders actions', () => {
    renderWithProviders(<PageHeader title="محصولات" actions={<button>افزودن</button>} />);
    expect(screen.getByRole('button', { name: 'افزودن' })).toBeInTheDocument();
  });
});