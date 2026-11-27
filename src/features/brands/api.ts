import { api } from '../../services/api';

export function getBrands(params?: any) {
  return api.get('/brands', { params });
}

export function getBrand(id: string) {
  return api.get(`/brands/${id}`);
}

export function createBrand(data: any) {
  return api.post('/brands', data);
}

export function updateBrand(id: string, data: any) {
  return api.put(`/brands/${id}`, data);
}