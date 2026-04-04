-- =============================================
-- V3: Manav/Kasap İyileştirmeleri
-- =============================================

-- OrderItem quantity alanını decimal yap (kg bazlı ürünler için)
ALTER TABLE order_items ALTER COLUMN quantity TYPE NUMERIC(10, 3) USING quantity::NUMERIC(10, 3);

-- OrderItem'a unit alanı ekle
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit VARCHAR(20) NOT NULL DEFAULT 'adet';

-- Ürün version alanı (optimistic locking desteği)
ALTER TABLE products ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
