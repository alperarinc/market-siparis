'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import Icon from '@/components/Icon';
import { getCategories } from '@/lib/api';

export default function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const [footerCategories, setFooterCategories] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin) {
      getCategories()
        .then((res) => setFooterCategories((res.data || []).slice(0, 5)))
        .catch(() => {});
    }
  }, [isAdmin]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="max-w-screen-2xl mx-auto px-6 py-8">{children}</main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-slate-50 mt-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-6 md:px-12 py-16 max-w-screen-2xl mx-auto">
          {/* Brand */}
          <div className="space-y-6">
            <div className="font-headline font-black text-xl text-orange-800 uppercase tracking-tighter">
              Köylüoğlu Market
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Tarladan sofranıza, en taze ve en doğal ürünleri özenle seçiyor ve sizin için paketliyoruz. Gerçek lezzeti keşfedin.
            </p>
            <div className="flex gap-4">
              <a className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary transition-colors" href="#">
                <Icon name="public" size={16} />
              </a>
              <a className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary transition-colors" href="#">
                <Icon name="mail" size={16} />
              </a>
            </div>
          </div>

          {/* Alışveriş */}
          <div>
            <h4 className="font-headline font-bold text-on-surface mb-6">Alışveriş</h4>
            <ul className="space-y-4 text-sm font-body">
              <li><Link className="text-slate-400 hover:text-orange-500 transition-opacity" href="/products">Tüm Ürünler</Link></li>
              {footerCategories.map((cat: any) => (
                <li key={cat.id}>
                  <Link className="text-slate-400 hover:text-orange-500 transition-opacity" href={`/products?category=${cat.id}`}>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Destek */}
          <div>
            <h4 className="font-headline font-bold text-on-surface mb-6">Destek</h4>
            <ul className="space-y-4 text-sm font-body">
              <li><Link className="text-slate-400 hover:text-orange-500 transition-opacity" href="/sayfa/hakkimizda">Hakkımızda</Link></li>
              <li><Link className="text-slate-400 hover:text-orange-500 transition-opacity" href="/sayfa/kvkk">KVKK</Link></li>
              <li><Link className="text-slate-400 hover:text-orange-500 transition-opacity" href="/sayfa/kullanim-kosullari">Kullanım Koşulları</Link></li>
              <li><Link className="text-slate-400 hover:text-orange-500 transition-opacity" href="/sayfa/iletisim">İletişim</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="p-8 rounded-4xl bg-surface-container flex flex-col items-center justify-center text-center">
            <h4 className="font-headline font-black text-lg mb-2">Bize Katılın</h4>
            <p className="text-slate-500 text-xs mb-6">Haftalık kampanya ve fırsatlardan haberdar olun.</p>
            <div className="w-full relative">
              <input
                className="w-full bg-white border-none rounded-full px-6 py-3 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-slate-300"
                placeholder="E-posta adresiniz"
                type="email"
              />
              <button className="absolute right-1 top-1 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 transition-transform">
                <Icon name="arrow_forward" size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="px-6 md:px-12 py-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 max-w-screen-2xl mx-auto">
          <span className="text-xs text-slate-500">&copy; 2026 Köylüoğlu Market. Tüm hakları saklıdır.</span>
          <div className="flex gap-8">
            <Link className="text-xs text-slate-400 hover:text-orange-500" href="/sayfa/kvkk">Gizlilik Politikası</Link>
            <Link className="text-xs text-slate-400 hover:text-orange-500" href="/sayfa/kullanim-kosullari">Kullanım Koşulları</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
