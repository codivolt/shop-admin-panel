import { api } from '../../services/api';

export function getAdminOrders(params?: any) {
  return api.get('/orders/admin', { params });
}