import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider } from './theme/ThemeProvider';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './hooks/useRedux';
import LoginPage from './pages/LoginPage';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import CategoriesPage from './pages/categories/CategoriesPage';
import CategoryAttributesPage from './pages/category-attributes/CategoryAttributesPage';
import CategoriesWizardPage from './pages/categories-add/CategoriesWizardPage';
import ProductsPage from './pages/products/ProductsPage';
import ProductAddPage from './pages/products/ProductAddPage';
import ProductEditPage from './pages/products/ProductEditPage';
import FeaturedProductsPage from './pages/products/FeaturedProductsPage';
import BrandsPage from './pages/brands/BrandsPage';
import BrandAddPage from './pages/brands/BrandAddPage';
import BrandEditPage from './pages/brands/BrandEditPage';
import UsersPage from './pages/users/UsersPage';
import UserAddPage from './pages/users/UserAddPage';
import UserEditPage from './pages/users/UserEditPage';
import UserProfilePage from './pages/users/UserProfilePage';
import ReferralPage from './pages/referral/ReferralPage';
import DiscountsPage from './pages/discounts/DiscountsPage';
import OrdersPage from './pages/orders/OrdersPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import PermissionsPage from './pages/permissions/PermissionsPage';
import DeliveryPage from './pages/delivery/DeliveryPage';
import PaymentAccountsPage from './pages/payment-accounts/PaymentAccountsPage';
import NotFoundPage from './pages/NotFoundPage';
import AuditLogsPage from './pages/audit/AuditLogsPage';
import { PERMISSIONS } from './constants';
import toast, { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PermissionGuard({
  permission,
  children,
}: {
  permission: string | string[];
  children: React.ReactNode;
}) {
  const { user } = useAppSelector((state) => state.auth);
  const permissions = user?.permissions || [];
  const required = Array.isArray(permission) ? permission : [permission];
  if (user?.role === 'super_admin' || required.some((p) => permissions.includes(p))) {
    return <>{children}</>;
  }
  toast.error('دسترسی به این بخش وجود ندارد');
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
      <Provider store={store}>
        <BrowserRouter>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: 'var(--surface)',
                color: 'var(--fg)',
                border: '1px solid var(--border)',
                fontSize: '13px',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route
                path="products"
                element={
                  <PermissionGuard
                    permission={[
                      PERMISSIONS.PRODUCTS_VIEW,
                      PERMISSIONS.PRODUCTS_CREATE,
                      PERMISSIONS.PRODUCTS_UPDATE,
                      PERMISSIONS.PRODUCTS_DELETE,
                    ]}
                  >
                    <ProductsPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="featured-products"
                element={
                  <PermissionGuard
                    permission={[
                      PERMISSIONS.PRODUCTS_VIEW,
                      PERMISSIONS.PRODUCTS_UPDATE,
                    ]}
                  >
                    <FeaturedProductsPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="products/add"
                element={
                  <PermissionGuard permission={PERMISSIONS.PRODUCTS_CREATE}>
                    <ProductAddPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="products/:id/edit"
                element={
                  <PermissionGuard permission={PERMISSIONS.PRODUCTS_UPDATE}>
                    <ProductEditPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="brands"
                element={
                  <PermissionGuard
                    permission={[
                      PERMISSIONS.BRANDS_VIEW,
                      PERMISSIONS.BRANDS_CREATE,
                      PERMISSIONS.BRANDS_UPDATE,
                    ]}
                  >
                    <BrandsPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="brands/add"
                element={
                  <PermissionGuard permission={PERMISSIONS.BRANDS_CREATE}>
                    <BrandAddPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="brands/:id/edit"
                element={
                  <PermissionGuard permission={PERMISSIONS.BRANDS_UPDATE}>
                    <BrandEditPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="categories"
                element={
                  <PermissionGuard
                    permission={[
                      PERMISSIONS.CATEGORIES_VIEW,
                      PERMISSIONS.CATEGORIES_CREATE,
                      PERMISSIONS.CATEGORIES_UPDATE,
                      PERMISSIONS.CATEGORIES_DELETE,
                    ]}
                  >
                    <CategoriesPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="categories/add"
                element={
                  <PermissionGuard permission={PERMISSIONS.CATEGORIES_CREATE}>
                    <CategoriesWizardPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="categories/:id/edit"
                element={
                  <PermissionGuard permission={PERMISSIONS.CATEGORIES_UPDATE}>
                    <CategoriesWizardPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="category-attributes"
                element={
                  <PermissionGuard
                    permission={[
                      PERMISSIONS.CATEGORIES_ATTRIBUTES_VIEW,
                      PERMISSIONS.CATEGORIES_ATTRIBUTES_CREATE,
                      PERMISSIONS.CATEGORIES_ATTRIBUTES_UPDATE,
                      PERMISSIONS.CATEGORIES_ATTRIBUTES_DELETE,
                    ]}
                  >
                    <CategoryAttributesPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="users"
                element={
                  <PermissionGuard permission={PERMISSIONS.USERS_VIEW}>
                    <UsersPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="users/add"
                element={
                  <PermissionGuard permission={PERMISSIONS.USERS_VIEW}>
                    <UserAddPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="users/:id/edit"
                element={
                  <PermissionGuard permission={PERMISSIONS.USERS_VIEW}>
                    <UserEditPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="users/:id"
                element={
                  <PermissionGuard permission={PERMISSIONS.USERS_VIEW}>
                    <UserProfilePage />
                  </PermissionGuard>
                }
              />
              <Route
                path="referral"
                element={
                  <PermissionGuard permission={PERMISSIONS.USERS_VIEW}>
                    <ReferralPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="orders"
                element={
                  <PermissionGuard
                    permission={[
                      PERMISSIONS.ORDERS_VIEW,
                      PERMISSIONS.ORDERS_UPDATE,
                      PERMISSIONS.ORDERS_DELETE,
                    ]}
                  >
                    <OrdersPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="notifications"
                element={
                  <PermissionGuard
                    permission={[
                      PERMISSIONS.NOTIFICATIONS_VIEW,
                      PERMISSIONS.NOTIFICATIONS_UPDATE,
                    ]}
                  >
                    <NotificationsPage />
                  </PermissionGuard>
                }
              />
<Route
                path="delivery"
                element={
                  <PermissionGuard permission={[
                    PERMISSIONS.DELIVERY_VIEW,
                    PERMISSIONS.DELIVERY_CREATE,
                    PERMISSIONS.DELIVERY_UPDATE,
                    PERMISSIONS.DELIVERY_DELETE,
                  ]}
                  >
                    <DeliveryPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="discounts"
                element={
                  <PermissionGuard permission={[
                    PERMISSIONS.PRODUCTS_VIEW,
                    PERMISSIONS.PRODUCTS_CREATE,
                    PERMISSIONS.PRODUCTS_UPDATE,
                    PERMISSIONS.PRODUCTS_DELETE,
                  ]}
                  >
                    <DiscountsPage />
                  </PermissionGuard>
                }
              />
              <Route path="permissions" element={<PermissionsPage />} />
              <Route
                path="audit-logs"
                element={
                  <PermissionGuard permission={PERMISSIONS.ORDERS_VIEW}>
                    <AuditLogsPage />
                  </PermissionGuard>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
              <Route
                path="payment-accounts"
                element={
                  <PermissionGuard
                    permission={[
                      PERMISSIONS.PAYMENTS_VIEW,
                      PERMISSIONS.PAYMENTS_CREATE,
                      PERMISSIONS.PAYMENTS_UPDATE,
                      PERMISSIONS.PAYMENTS_DELETE,
                    ]}
                  >
                    <PaymentAccountsPage />
                  </PermissionGuard>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
