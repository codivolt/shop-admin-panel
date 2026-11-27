import { api } from '../../services/api';

export function getAuditLogs(params: any) {
  return api.get('/audit-logs', { params });
}