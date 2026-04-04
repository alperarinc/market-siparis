ALTER TABLE products ADD COLUMN image_urls VARCHAR(2000);
ALTER TABLE products ADD COLUMN brand VARCHAR(100);
ALTER TABLE products ADD COLUMN origin VARCHAR(100);
ALTER TABLE products ADD COLUMN weight_info VARCHAR(100);
ALTER TABLE products ADD COLUMN storage_conditions VARCHAR(500);
ALTER TABLE products ADD COLUMN ingredients VARCHAR(2000);

-- Ornek veriler guncelle
UPDATE products SET brand = 'Köylüoğlu', origin = 'Tokat' WHERE slug IN ('domates-kg', 'salatalik-kg', 'elma-starking-kg', 'patates-kg');
UPDATE products SET brand = 'Yerli', origin = 'Türkiye' WHERE brand IS NULL;
UPDATE products SET weight_info = '1 kg' WHERE unit = 'kg';
UPDATE products SET weight_info = '1 adet' WHERE unit = 'adet' AND weight_info IS NULL;
UPDATE products SET storage_conditions = 'Serin ve kuru yerde saklayiniz' WHERE storage_conditions IS NULL;
