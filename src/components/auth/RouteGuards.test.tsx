import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { PermissionGuard, ProtectedRoute } from './RouteGuards';
import { renderWithProviders } from '../../test/render';
import { store } from '../../store';
import { loginSuccess, logout } from '../../store/authSlice';

const user = {
  id: 'u1',
  email: 'a@b.c',
  firstName: 'الف',
  lastName: 'ب',
  role: 'admin',
  permissions: ['PRODUCTS_VIEW'],
};

function renderGuard(node: React.ReactNode) {
  return renderWithProviders(
    <Routes>
      <Route path="/secret" element={node} />
      <Route path="/login" element={<div>صفحه ورود</div>} />
      <Route path="/dashboard" element={<div>داشبورد</div>} />
    </Routes>,
    { route: '/secret' },
  );
}

describe('RouteGuards', () => {
  beforeEach(() => {
    store.dispatch(logout());
  });

  it('redirects unauthenticated users to login', () => {
    renderGuard(
      <ProtectedRoute>
        <div>محتوای محافظت‌شده</div>
      </ProtectedRoute>,
    );
    expect(screen.getByText('صفحه ورود')).toBeInTheDocument();
  });

  it('renders children for authenticated users', () => {
    store.dispatch(loginSuccess({ token: 't', user }));
    renderGuard(
      <ProtectedRoute>
        <div>محتوای محافظت‌شده</div>
      </ProtectedRoute>,
    );
    expect(screen.getByText('محتوای محافظت‌شده')).toBeInTheDocument();
  });

  it('allows super admins through PermissionGuard', () => {
    store.dispatch(
      loginSuccess({ token: 't', user: { ...user, role: 'super_admin', permissions: [] } }),
    );
    renderGuard(
      <PermissionGuard permission="ANY">
        <div>مجاز</div>
      </PermissionGuard>,
    );
    expect(screen.getByText('مجاز')).toBeInTheDocument();
  });

  it('redirects when the permission is missing', () => {
    store.dispatch(loginSuccess({ token: 't', user }));
    renderGuard(
      <PermissionGuard permission="ORDERS_VIEW">
        <div>مجاز</div>
      </PermissionGuard>,
    );
    expect(screen.getByText('داشبورد')).toBeInTheDocument();
  });
});