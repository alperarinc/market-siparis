'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon';

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

  return (
    <div className={`relative ${height} rounded-4xl overflow-hidden group bg-surface-container-low`}>
      {/* Slides */}
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
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
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity backdrop-blur-sm"
          >
            <Icon name="chevron_left" className="text-on-surface" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity backdrop-blur-sm"
          >
            <Icon name="chevron_right" className="text-on-surface" />
          </button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${i === current ? 'w-8 h-2.5 bg-white shadow-sm' : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/70'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
