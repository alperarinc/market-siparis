'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Link from 'next/link';

interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
}

interface Props {
  banners: Banner[];
  height?: string;
  autoPlay?: boolean;
  interval?: number;
}

export default function BannerSlider({ banners, height = 'h-[400px]', autoPlay = true, interval = 5000 }: Props) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prev = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, next, banners.length]);

  if (banners.length === 0) return null;

  const Wrapper = banners[current]?.linkUrl ? Link : 'div';
  const wrapperProps = banners[current]?.linkUrl ? { href: banners[current].linkUrl } : {};

  return (
    <div className={`relative ${height} rounded-xl overflow-hidden group bg-gray-100`}>
      {/* Slides */}
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-500 ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          {banner.linkUrl ? (
            <Link href={banner.linkUrl} className="block w-full h-full">
              <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
            </Link>
          ) : (
            <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
          )}
        </div>
      ))}

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          >
            <FiChevronLeft size={20} className="text-gray-700" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          >
            <FiChevronRight size={20} className="text-gray-700" />
          </button>
        </>
      )}

      {/* Counter */}
      {banners.length > 1 && (
        <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
          {current + 1} / {banners.length}
        </div>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/70'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
