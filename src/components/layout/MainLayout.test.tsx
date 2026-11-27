import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import MainLayout from './MainLayout';
import { renderWithProviders } from '../../test/render';

const get = vi.fn();
vi.mock('../../services/api', () => ({
  api: { get: (...args: unknown[]) => get(...args) },
}));

describe('MainLayout', () => {
  beforeEach(() => {
    get.mockReset();
    get.mockResolvedValue({ data: 0 });
  });

  it('renders the header and the routed outlet', () => {
    renderWithProviders(
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<div>داشبورد</div>} />
        </Route>
      </Routes>,
    );
    expect(screen.getByText('خروج')).toBeInTheDocument();
    expect(screen.getAllByText('داشبورد').length).toBeGreaterThan(0);
  });
});