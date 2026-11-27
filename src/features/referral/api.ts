import { api } from '../../services/api';

export function getReferralStats() {
  return api.get('/users/referral/stats');
}

export function getReferralTiers() {
  return api.get('/users/referral/tiers');
}

export function createReferralTier(data: any) {
  return api.post('/users/referral/tiers', data);
}

export function updateReferralTier(id: string, data: any) {
  return api.put(`/users/referral/tiers/${id}`, data);
}

export function deleteReferralTier(id: string) {
  return api.delete(`/users/referral/tiers/${id}`);
}