import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';

import Header from './Header';
import { renderWithProviders } from '../../test/render';

const get = vi.fn();
vi.mock('../../services/api', () => ({
  api: { get: (...args: unknown[]) => get(...args) },
}));

describe('Header', () => {
  beforeEach(() => {
    get.mockReset();
    get.mockResolvedValue({ data: 0 });
  });

  it('renders the logout action and opens the sidebar', () => {
    renderWithProviders(<Header onOpenSidebar={() => {}} />);
    expect(screen.getByText('خروج')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'منو' })).toBeInTheDocument();
  });
});