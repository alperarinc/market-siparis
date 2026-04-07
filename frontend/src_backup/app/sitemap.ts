import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://koyluoglufresh.com';
const API_URL = process.env.BACKEND_URL || 'http://localhost:8080/api';

async function fetchData<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch { return null; }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  // Ürünler
  const products = await fetchData<any>('/products?page=0&size=1000');
  if (products?.content) {
    for (const p of products.content) {
      entries.push({
        url: `${SITE_URL}/products/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      });
    }
  }

  // Kategoriler
  const categories = await fetchData<any[]>('/categories');
  if (categories) {
    for (const c of categories) {
      entries.push({
        url: `${SITE_URL}/products?category=${c.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  // Statik sayfalar
  const pages = await fetchData<any[]>('/pages');
  if (pages) {
    for (const p of pages) {
      entries.push({
        url: `${SITE_URL}/sayfa/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
  }

  return entries;
}
