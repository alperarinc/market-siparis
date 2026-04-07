import { serverFetch } from '@/lib/server-api';
import BannerSlider from '@/components/BannerSlider';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

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
    <div className="space-y-16">
      {/* Promo Banners */}
      {promoBanners?.length > 0 && (
        <BannerSlider banners={promoBanners} height="h-[100px] md:h-[120px]" interval={4000} />
      )}

      {/* Hero Section */}
      {heroBanners?.length > 0 ? (
        <BannerSlider banners={heroBanners} height="h-[300px] md:h-[500px]" interval={5000} />
      ) : (
        <section className="relative min-h-[400px] md:min-h-[550px] flex items-center overflow-hidden bg-surface-container rounded-4xl">
          <div className="max-w-screen-2xl mx-auto px-8 grid md:grid-cols-2 gap-12 items-center w-full relative z-10">
            <div className="space-y-8">
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-sm font-medium uppercase tracking-wider">
                Mevsimlik Hasat Geldi
              </span>
              <h1 className="font-headline text-4xl md:text-6xl font-black tracking-tight text-on-surface leading-[1.1]">
                Yerel Tarlalardan <br />
                <span className="text-primary-container">Mutfaginiza.</span>
              </h1>
              <p className="text-on-surface-variant text-lg max-w-lg leading-relaxed">
                Akdeniz'in en taze lezzetlerini kesfeden. El yapimi, organik ürünler 24 saat icinde kapinizda.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="/products"
                  className="px-10 py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                >
                  Simdi Alisveris Yap
                </Link>
                <Link
                  href="/products"
                  className="px-10 py-4 bg-surface-container-highest text-on-surface rounded-full font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Kategorileri Kesfet
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent" />
        </section>
      )}

      {/* Feature Badges */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4 p-6 bg-surface-container-lowest rounded-4xl">
          <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined">local_shipping</span>
          </div>
          <div>
            <p className="font-headline font-bold text-on-surface">Ayni Gün Teslimat</p>
            <p className="text-sm text-on-surface-variant">
              {settings?.free_delivery_min || '200'} TL üstü ücretsiz
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6 bg-surface-container-lowest rounded-4xl">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">verified</span>
          </div>
          <div>
            <p className="font-headline font-bold text-on-surface">Kalite Garantisi</p>
            <p className="text-sm text-on-surface-variant">Sertifikali organik ürünler</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6 bg-surface-container-lowest rounded-4xl">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-primary-container">
            <span className="material-symbols-outlined">eco</span>
          </div>
          <div>
            <p className="font-headline font-bold text-on-surface">Sürdürülebilir Tedarik</p>
            <p className="text-sm text-on-surface-variant">40+ yerel üreticiyle ortaklik</p>
          </div>
        </div>
      </section>

      {/* Categories Bento Grid */}
      {categories?.length > 0 && (
        <section>
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Kategoriler</h2>
              <p className="text-on-surface-variant">En iyi yerel üreticilerden özenle secilmis ürünler</p>
            </div>
            <Link href="/products" className="text-primary font-semibold flex items-center gap-2 group">
              Tüm Kategorileri Gör
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="group bg-surface-container-lowest rounded-3xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.icon || '🛒'}</div>
                <p className="text-sm font-headline font-bold text-on-surface group-hover:text-primary transition-colors">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured?.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Yerel Favoriler</h2>
              <p className="text-on-surface-variant">Müsterilerimizin en cok tercih ettigi ürünler</p>
            </div>
            <Link href="/products" className="text-primary font-semibold flex items-center gap-2 group">
              Tümünü Gör
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {featured.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative bg-primary-container rounded-4xl overflow-hidden p-10 md:p-16 flex flex-col justify-end min-h-[300px]">
        <div className="relative z-10">
          <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest mb-4">
            Ilk Siparise Özel
          </span>
          <h2 className="font-headline font-black text-3xl md:text-4xl text-white leading-tight mb-4">
            Hemen Üye Ol,<br />Ücretsiz Teslimat Kazan
          </h2>
          <p className="text-white/80 text-sm font-medium mb-8 max-w-md">
            Ilk siparisinde ücretsiz teslimat firsatini yakala. Taze ürünler kapinda.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white text-primary-container font-headline font-bold px-8 py-4 rounded-full hover:scale-105 transition-transform"
          >
            Hemen Üye Ol
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
