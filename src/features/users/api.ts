import { api } from '../../services/api';

export function getUsers(params?: any) {
  return api.get('/users', { params });
}

export function getUser(id: string) {
  return api.get(`/users/${id}`);
}

export function createUser(data: any) {
  return api.post('/users', data);
}

export function updateUser(id: string, data: any) {
  return api.put(`/users/${id}`, data);
}

export function deleteUser(id: string) {
  return api.delete(`/users/${id}`);
}