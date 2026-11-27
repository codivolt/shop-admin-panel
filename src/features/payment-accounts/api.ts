import { api } from '../../services/api';

export function getPaymentAccounts() {
  return api.get('/payment-accounts');
}

export function createPaymentAccount(data: any) {
  return api.post('/payment-accounts', data);
}

export function updatePaymentAccount(id: string, data: any) {
  return api.put(`/payment-accounts/${id}`, data);
}

export function deletePaymentAccount(id: string) {
  return api.delete(`/payment-accounts/${id}`);
}