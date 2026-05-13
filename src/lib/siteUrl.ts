const raw = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const SITE_URL = raw.replace(/\/$/, '');

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}
