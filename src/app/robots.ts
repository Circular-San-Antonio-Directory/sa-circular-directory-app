import type { MetadataRoute } from 'next';
import { absoluteUrl, SITE_URL } from '@/lib/siteUrl';

const PROD_URL = 'https://directory.circularsanantonio.org';

export default function robots(): MetadataRoute.Robots {
  if (SITE_URL !== PROD_URL) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/design-system', '/api', '/about', '/explore', '/join'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
