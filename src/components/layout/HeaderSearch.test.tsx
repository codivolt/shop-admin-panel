import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';

import HeaderSearch from './HeaderSearch';
import { renderWithProviders } from '../../test/render';

const get = vi.fn();
vi.mock('../../services/api', () => ({
  api: { get: (...args: unknown[]) => get(...args) },
}));

describe('HeaderSearch', () => {
  beforeEach(() => {
    get.mockReset();
    get.mockResolvedValue({ data: [] });
  });

  it('renders the search input', () => {
    renderWithProviders(<HeaderSearch />);
    expect(screen.getByPlaceholderText('جستجو در پنل…')).toBeInTheDocument();
  });
});