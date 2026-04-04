-- Urun fiyatlari
ALTER TABLE products ALTER COLUMN price TYPE NUMERIC(10,3);
ALTER TABLE products ALTER COLUMN discounted_price TYPE NUMERIC(10,3);

-- Siparis tutarlari
ALTER TABLE orders ALTER COLUMN subtotal TYPE NUMERIC(10,3);
ALTER TABLE orders ALTER COLUMN delivery_fee TYPE NUMERIC(10,3);
ALTER TABLE orders ALTER COLUMN discount_amount TYPE NUMERIC(10,3);
ALTER TABLE orders ALTER COLUMN total_vat TYPE NUMERIC(10,3);
ALTER TABLE orders ALTER COLUMN total_amount TYPE NUMERIC(10,3);

-- Siparis kalemleri
ALTER TABLE order_items ALTER COLUMN unit_price TYPE NUMERIC(10,3);
ALTER TABLE order_items ALTER COLUMN total_price TYPE NUMERIC(10,3);
ALTER TABLE order_items ALTER COLUMN vat_amount TYPE NUMERIC(10,3);
