-- Kategori bazli KDV orani
ALTER TABLE categories ADD COLUMN vat_rate NUMERIC(5,2) DEFAULT 10;

-- Urun bazli fiyat KDV dahil mi
ALTER TABLE products ADD COLUMN price_includes_vat BOOLEAN NOT NULL DEFAULT true;

-- Siparis KDV toplami
ALTER TABLE orders ADD COLUMN total_vat NUMERIC(10,2) DEFAULT 0;

-- Siparis kalemi KDV bilgileri
ALTER TABLE order_items ADD COLUMN vat_rate NUMERIC(5,2) DEFAULT 10;
ALTER TABLE order_items ADD COLUMN vat_amount NUMERIC(10,2) DEFAULT 0;

-- Turkiye KDV oranlari
UPDATE categories SET vat_rate = 1 WHERE slug IN ('temel-gida', 'firin-pastane');
UPDATE categories SET vat_rate = 10 WHERE slug IN ('meyve-sebze', 'sut-kahvaltilik', 'et-tavuk-balik', 'icecekler');
UPDATE categories SET vat_rate = 20 WHERE slug IN ('temizlik', 'kisisel-bakim', 'atistirmalik', 'dondurma-donuk');
