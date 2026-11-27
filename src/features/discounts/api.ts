import { api } from '../../services/api';

export function getDiscounts(params?: any) {
  return api.get('/discounts', { params });
}

export function getDiscountStats() {
  return api.get('/discounts/stats');
}

export function createDiscount(data: any) {
  return api.post('/discounts', data);
}

export function updateDiscount(id: string, data: any) {
  return api.put(`/discounts/${id}`, data);
}

export function deleteDiscount(id: string) {
  return api.delete(`/discounts/${id}`);
}