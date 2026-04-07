'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';
import { getCategories, getSettings } from '@/lib/api';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiMapPin, FiPhone, FiPackage, FiGrid, FiChevronDown } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
}

export default function Header() {
  const { isAuthenticated, user, cartCount } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
    getSettings()
      .then((res) => setSettings(res.data || {}))
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setMenuOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top info bar */}
      <div className="bg-gray-900 text-gray-300 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-8">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <FiMapPin size={11} />
              Tokat Merkez
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <FiPhone size={11} />
              0850 XXX XX XX
            </span>
          </div>
          <div className="flex items-center gap-3">
            {settings.free_delivery_enabled === 'true' && (
              <span className="text-brand-orange-400 font-medium">
                {settings.free_delivery_min || '200'} TL üstü ücretsiz teslimat
              </span>
            )}
            {settings.free_delivery_enabled !== 'true' && (
              <span className="text-brand-orange-400 font-medium">
                {settings.store_city || 'Tokat Merkez'}'e teslimat
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4 lg:gap-8">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img src="/logo.png" alt="Köylüoğlu Fresh" className="h-10 w-10 rounded-full object-cover border-2 border-brand-orange-200" />
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-lg font-black text-gray-900 tracking-tight">KÖYLÜOĞLU</span>
                <span className="text-[10px] font-bold text-brand-green-600 tracking-widest uppercase">Fresh Market</span>
              </div>
            </Link>

            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Ürün, kategori veya marka ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-5 pr-14 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange-400 focus:border-brand-orange-400 focus:bg-white transition-all"
                />
                <button type="submit" className="absolute right-0 top-0 h-11 w-12 flex items-center justify-center bg-brand-orange-500 text-white rounded-r-lg hover:bg-brand-orange-600 transition">
                  <FiSearch size={18} />
                </button>
              </div>
            </form>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {isAuthenticated && (
                <Link href="/orders" className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition">
                  <FiPackage size={20} />
                  <span className="text-sm font-medium">Siparişlerim</span>
                </Link>
              )}

              {isAuthenticated ? (
                <Link href="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition">
                  <div className="w-8 h-8 rounded-full bg-brand-orange-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-brand-orange-600">{user?.fullName?.charAt(0) || 'K'}</span>
                  </div>
                  <div className="hidden lg:flex flex-col leading-tight">
                    <span className="text-[10px] text-gray-400">Hoşgeldin</span>
                    <span className="text-sm font-semibold text-gray-800 max-w-[100px] truncate">{user?.fullName || 'Hesabım'}</span>
                  </div>
                </Link>
              ) : (
                <Link href="/login" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition">
                  <FiUser size={20} />
                  <span className="hidden lg:inline text-sm font-medium">Giriş Yap</span>
                </Link>
              )}

              <Link href="/cart" className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-brand-orange-500 hover:bg-brand-orange-600 text-white rounded-lg transition relative">
                <FiShoppingCart size={20} />
                <div className="hidden sm:flex flex-col leading-tight">
                  <span className="text-[10px] font-medium opacity-80">Sepetim</span>
                  <span className="text-sm font-bold">{cartCount} ürün</span>
                </div>
                {cartCount > 0 && (
                  <span className="sm:hidden absolute -top-1 -right-1 bg-white text-brand-orange-500 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-50 transition"
              >
                {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Department navigation */}
      {categories.length > 0 && (
        <div className="bg-white border-b border-gray-100 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center h-10">
              {/* Kategoriler dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 h-10 text-sm font-semibold text-brand-orange-600 hover:bg-brand-orange-50 transition">
                  <FiGrid size={15} />
                  Kategoriler
                  <FiChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
                </button>
                <div className="absolute left-0 top-full w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <Link href="/products" className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-brand-orange-600 hover:bg-brand-orange-50 transition">
                    <FiGrid size={14} />
                    Tüm Ürünler
                  </Link>
                  <div className="h-px bg-gray-100 my-1" />
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.id}`}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
                    >
                      {cat.icon && <span>{cat.icon}</span>}
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="w-px h-5 bg-gray-200" />

              {/* Quick links - ilk 6 kategori */}
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  className="px-3 h-10 flex items-center text-[13px] text-gray-600 hover:text-brand-orange-600 transition"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-4 pr-12 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange-400"
                />
                <button type="submit" className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center bg-brand-orange-500 text-white rounded-r-lg">
                  <FiSearch size={18} />
                </button>
              </div>
            </form>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/products" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
                <FiGrid size={16} className="text-brand-orange-500" /> Tüm Ürünler
              </Link>
              <Link href="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
                <FiPackage size={16} className="text-brand-green-600" /> Siparişlerim
              </Link>
            </div>
            {categories.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                  >
                    {cat.icon && <span>{cat.icon}</span>} {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
