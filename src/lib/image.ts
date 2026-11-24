import { API_URL } from '../config';

export function getAbsoluteImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `${API_URL}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}