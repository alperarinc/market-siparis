import { serverFetch } from '@/lib/server-api';
import BannerSlider from '@/components/BannerSlider';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { FiArrowRight, FiTruck, FiClock, FiShield, FiPercent } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [categories, featured, heroBanners, promoBanners, settings] = await Promise.all([
    serverFetch<any[]>('/categories'),
    serverFetch<any[]>('/products/featured'),
    serverFetch<any[]>('/banners/hero'),
    serverFetch<any[]>('/banners/promo'),
    serverFetch<Record<string, string>>('/settings'),
  ]);

  return (
    <div className="space-y-8">
      {promoBanners?.length > 0 && (
        <BannerSlider banners={promoBanners} height="h-[100px] md:h-[120px]" interval={4000} />
      )}

      {heroBanners?.length > 0 ? (
        <BannerSlider banners={heroBanners} height="h-[250px] md:h-[400px]" interval={5000} />
      ) : (
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-orange-600 to-brand-orange-500 text-white p-8 md:p-10 min-h-[250px] md:min-h-[400px] flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-black leading-tight mb-3">
            Taze Ürünler<br/>Kapınıza Gelsin
          </h1>
          <p className="text-orange-100 text-sm mb-6 max-w-sm">
            Meyve, sebze, et, şarküteri ve daha fazlası — her gün taze, her gün uygun fiyat.
          </p>
          <Link href="/products" className="inline-flex items-center gap-2 bg-white text-brand-orange-600 px-6 py-3 rounded-lg font-bold text-sm hover:bg-orange-50 transition w-fit">
            Alışverişe Başla <FiArrowRight size={16} />
          </Link>
        </section>
      )}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {settings?.free_delivery_enabled === 'true' && (
          <div className="bg-white rounded-lg p-4 flex items-center gap-3 border border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-brand-orange-50 flex items-center justify-center text-brand-orange-500"><FiTruck size={20} /></div>
            <div><p className="text-sm font-semibold text-gray-900">Ücretsiz Teslimat</p><p className="text-xs text-gray-400">{settings.free_delivery_min || '200'} TL üstü</p></div>
          </div>
        )}
        {settings?.same_day_enabled === 'true' && (
          <div className="bg-white rounded-lg p-4 flex items-center gap-3 border border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500"><FiClock size={20} /></div>
            <div><p className="text-sm font-semibold text-gray-900">Aynı Gün Teslimat</p><p className="text-xs text-gray-400">{settings.same_day_cutoff || '14:00'} öncesi</p></div>
          </div>
        )}
        <div className="bg-white rounded-lg p-4 flex items-center gap-3 border border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-brand-green-600"><FiShield size={20} /></div>
          <div><p className="text-sm font-semibold text-gray-900">Güvenli Alışveriş</p><p className="text-xs text-gray-400">Kalite garantisi</p></div>
        </div>
        <div className="bg-white rounded-lg p-4 flex items-center gap-3 border border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500"><FiPercent size={20} /></div>
          <div><p className="text-sm font-semibold text-gray-900">Haftalık Fırsatlar</p><p className="text-xs text-gray-400">Özel indirimler</p></div>
        </div>
      </section>

      {categories?.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">Kategoriler</h2>
            <Link href="/products" className="text-sm text-brand-orange-500 hover:text-brand-orange-600 font-semibold flex items-center gap-1">Tümünü Gör <FiArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {categories.map((cat: any) => (
              <Link key={cat.id} href={`/products?category=${cat.id}`} className="group bg-white rounded-lg p-4 text-center hover:shadow-md transition border border-gray-100 hover:border-brand-orange-200">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon || '📦'}</div>
                <p className="text-xs font-semibold text-gray-700 group-hover:text-brand-orange-600 transition-colors leading-tight">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured?.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">Çok Satanlar</h2>
              <span className="bg-red-50 text-red-600 text-[11px] font-bold px-2.5 py-1 rounded-full">Popüler</span>
            </div>
            <Link href="/products" className="text-sm text-brand-orange-500 hover:text-brand-orange-600 font-semibold flex items-center gap-1">Tümünü Gör <FiArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {featured.map((product: any) => (<ProductCard key={product.id} product={product} />))}
          </div>
        </section>
      )}

      <section className="bg-gray-900 rounded-xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">İlk Siparişine Özel</h3>
          <p className="text-gray-400 text-sm max-w-md">Hemen üye ol, ilk siparişinde ücretsiz teslimat fırsatını yakala.</p>
        </div>
        <Link href="/login" className="bg-brand-orange-500 text-white px-8 py-3.5 rounded-lg font-bold text-sm hover:bg-brand-orange-600 transition shrink-0">Hemen Üye Ol</Link>
      </section>
    </div>
  );
}
