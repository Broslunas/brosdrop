
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sitemap',
  description: 'Sitemap for BrosDrop',
};

export default function sitemap() {
  const baseUrl = 'https://brosdrop.com';

  const routes = [
    '',
    '/features',
    '/help',
    '/privacy',
    '/terms',
    '/cookies',
    '/gdpr',
    '/login',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }));

  return routes;
}
