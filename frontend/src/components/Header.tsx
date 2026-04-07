'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';
import { getCategories, getSettings } from '@/lib/api';
import Icon from '@/components/Icon';
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
    <header className="sticky top-0 w-full z-50 glass-nav shadow-sm shadow-orange-900/5">
      <div className="flex items-center justify-between px-6 py-4 max-w-screen-2xl mx-auto">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tighter text-orange-800 font-headline">
          Köylüoğlu Market
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {categories.slice(0, 4).map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className="text-slate-600 hover:text-orange-600 transition-colors font-body text-sm"
            >
              {cat.name}
            </Link>
          ))}
          {categories.length === 0 && (
            <>
              <Link href="/products" className="text-slate-600 hover:text-orange-600 transition-colors font-body text-sm">Taze Ürünler</Link>
              <Link href="/products" className="text-slate-600 hover:text-orange-600 transition-colors font-body text-sm">Organik</Link>
            </>
          )}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-surface-container-low px-4 py-2 rounded-full ring-1 ring-outline-variant/15">
            <Icon name="search" className="text-on-surface-variant text-lg" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm w-48 font-body placeholder:text-slate-400"
              placeholder="Ürün ara..."
            />
          </form>

          {/* Icon buttons */}
          <div className="flex items-center gap-1">
            {isAuthenticated && (
              <Link href="/orders" className="p-2 hover:bg-slate-50/50 rounded-full transition-colors hidden sm:flex">
                <Icon name="local_shipping" className="text-on-surface-variant" />
              </Link>
            )}

            <Link href="/cart" className="p-2 hover:bg-slate-50/50 rounded-full transition-colors relative">
              <Icon name="shopping_cart" className="text-on-surface-variant" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <Link href="/profile" className="p-2 hover:bg-slate-50/50 rounded-full transition-colors">
                <Icon name="person" className="text-on-surface-variant" />
              </Link>
            ) : (
              <Link href="/login" className="p-2 hover:bg-slate-50/50 rounded-full transition-colors">
                <Icon name="person" className="text-on-surface-variant" />
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-slate-50/50 rounded-full transition-colors"
            >
              <Icon name={menuOpen ? 'close' : 'menu'} className="text-on-surface-variant" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg">
          <div className="max-w-screen-2xl mx-auto px-6 py-4 space-y-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-full bg-surface-container-low border-none text-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </form>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/products" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low text-sm font-medium">
                <Icon name="grid_view" className="text-primary" /> Tüm Ürünler
              </Link>
              <Link href="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low text-sm font-medium">
                <Icon name="local_shipping" className="text-secondary" /> Siparişlerim
              </Link>
            </div>
            {categories.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl text-sm text-slate-600 hover:bg-surface-container-low transition"
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
