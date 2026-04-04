import { serverFetch } from '@/lib/server-api';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await serverFetch<any>(`/products/${params.slug}`);
  if (!product) return { title: 'Ürün Bulunamadı' };
  return {
    title: `${product.name} — Köylüoğlu Fresh`,
    description: product.description || `${product.name} - ${product.categoryName}`,
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await serverFetch<any>(`/products/${params.slug}`);
  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
