import { api } from '../../services/api';

export function getPermissions() {
  return api.get('/permissions');
}

export function getRolePermissions() {
  return api.get('/permissions/roles');
}

export function updateRolePermissions(role: string, permissionKeys: string[]) {
  return api.put(`/permissions/roles/${role}`, { permissionKeys });
}

export function createPermission(data: any) {
  return api.post('/permissions', data);
}

export function deletePermission(id: string) {
  return api.delete(`/permissions/${id}`);
}