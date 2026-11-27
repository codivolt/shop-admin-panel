import { api } from '../../services/api';

export function getNotifications() {
  return api.get('/notifications');
}

export function markNotificationRead(id: string) {
  return api.put(`/notifications/${id}/read`);
}

export function markNotificationsRead(ids: string[]) {
  return Promise.all(ids.map((id) => api.put(`/notifications/${id}/read`)));
}