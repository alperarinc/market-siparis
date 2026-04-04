'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>

      <footer className="bg-gray-900 text-gray-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Main footer */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-gray-800">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="Köylüoğlu Fresh" className="h-8 w-8 rounded-full object-cover border border-gray-700" />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-black text-white">KÖYLÜOĞLU</span>
                  <span className="text-[9px] font-bold text-brand-green-500 tracking-widest uppercase">Fresh Market</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Taze meyve, sebze, et, şarküteri ve günlük ihtiyaçlarınız için güvenilir zincir marketiniz.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Kategoriler</h4>
              <ul className="space-y-2.5 text-sm">
                {footerCategories.map((cat: any) => (
                  <li key={cat.id}>
                    <Link href={`/products?category=${cat.id}`} className="hover:text-white transition">{cat.name}</Link>
                  </li>
                ))}
                <li><Link href="/products" className="hover:text-white transition">Tüm Ürünler</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Hesabım</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/profile" className="hover:text-white transition">Profilim</Link></li>
                <li><Link href="/orders" className="hover:text-white transition">Siparişlerim</Link></li>
                <li><Link href="/cart" className="hover:text-white transition">Sepetim</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Giriş Yap</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">İletişim</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <FiPhone size={14} className="mt-0.5 shrink-0" />
                  0850 XXX XX XX
                </li>
                <li className="flex items-start gap-2">
                  <FiMail size={14} className="mt-0.5 shrink-0" />
                  info@koyluoglufresh.com
                </li>
                <li className="flex items-start gap-2">
                  <FiMapPin size={14} className="mt-0.5 shrink-0" />
                  Tokat Merkez, Türkiye
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <span>&copy; 2026 Köylüoğlu Fresh. Tüm hakları saklıdır.</span>
            <div className="flex items-center gap-4 flex-wrap">
              <Link href="/sayfa/hakkimizda" className="hover:text-gray-400 transition py-1">Hakkımızda</Link>
              <Link href="/sayfa/kvkk" className="hover:text-gray-400 transition py-1">KVKK</Link>
              <Link href="/sayfa/kullanim-kosullari" className="hover:text-gray-400 transition py-1">Kullanım Koşulları</Link>
              <Link href="/sayfa/iletisim" className="hover:text-gray-400 transition py-1">İletişim</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
