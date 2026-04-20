import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/siteUrl';

export default function robots(): MetadataRoute.Robots {
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
