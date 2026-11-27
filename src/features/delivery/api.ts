import { api } from '../../services/api';

export function getDeliveryMethods() {
  return api.get('/delivery');
}

export function createDeliveryMethod(data: any) {
  return api.post('/delivery', data);
}

export function updateDeliveryMethod(id: string, data: any) {
  return api.put(`/delivery/${id}`, data);
}

export function deleteDeliveryMethod(id: string) {
  return api.delete(`/delivery/${id}`);
}