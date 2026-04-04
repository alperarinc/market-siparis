-- Varsayılan admin kullanıcı
INSERT INTO users (phone, full_name, email, role) VALUES
('05001234567', 'Market Admin', 'admin@market.com', 'ADMIN');

-- Örnek kategoriler
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Meyve & Sebze', 'meyve-sebze', 'Taze meyve ve sebzeler', 1),
('Süt & Kahvaltılık', 'sut-kahvaltilik', 'Süt ürünleri, peynir, yumurta ve kahvaltılık ürünler', 2),
('Et & Tavuk & Balık', 'et-tavuk-balik', 'Taze et, tavuk ve balık ürünleri', 3),
('Temel Gıda', 'temel-gida', 'Un, şeker, yağ, makarna, pirinç ve bakliyat', 4),
('Atıştırmalık', 'atistirmalik', 'Cips, çikolata, bisküvi ve kuruyemiş', 5),
('İçecekler', 'icecekler', 'Su, meyve suyu, gazlı içecek ve çay', 6),
('Temizlik', 'temizlik', 'Ev temizlik ürünleri ve deterjanlar', 7),
('Kişisel Bakım', 'kisisel-bakim', 'Şampuan, sabun ve kişisel bakım ürünleri', 8),
('Dondurma & Donuk', 'dondurma-donuk', 'Dondurma ve dondurulmuş gıdalar', 9),
('Fırın & Pastane', 'firin-pastane', 'Ekmek, poğaça, börek ve pasta', 10);

-- Meyve alt kategoriler
INSERT INTO categories (name, slug, parent_id, sort_order) VALUES
('Meyveler', 'meyveler', 1, 1),
('Sebzeler', 'sebzeler', 1, 2);

-- Örnek ürünler
INSERT INTO products (category_id, name, slug, price, unit, stock_quantity, featured, description) VALUES
(1, 'Domates (kg)', 'domates-kg', 39.90, 'kg', 100, true, 'Taze sofralık domates'),
(1, 'Salatalık (kg)', 'salatalik-kg', 29.90, 'kg', 80, false, 'Taze çıtır salatalık'),
(1, 'Elma Starking (kg)', 'elma-starking-kg', 44.90, 'kg', 60, true, 'Taze starking elma'),
(1, 'Muz (kg)', 'muz-kg', 69.90, 'kg', 50, false, 'İthal taze muz'),
(1, 'Patates (kg)', 'patates-kg', 24.90, 'kg', 120, false, 'Yemeklik patates'),
(2, 'Süt 1L', 'sut-1l', 34.90, 'adet', 200, true, 'Günlük pastörize süt 1 litre'),
(2, 'Beyaz Peynir (kg)', 'beyaz-peynir-kg', 189.90, 'kg', 30, true, 'Tam yağlı beyaz peynir'),
(2, 'Yumurta 15li', 'yumurta-15li', 79.90, 'adet', 100, false, '15''li M boy yumurta'),
(2, 'Tereyağı 250g', 'tereyagi-250g', 89.90, 'adet', 60, false, 'Tereyağı 250 gram'),
(3, 'Dana Kıyma (kg)', 'dana-kiyma-kg', 349.90, 'kg', 25, true, 'Taze dana kıyma'),
(3, 'Tavuk Göğüs (kg)', 'tavuk-gogus-kg', 159.90, 'kg', 40, false, 'Taze tavuk göğüs fileto'),
(4, 'Ekmek', 'ekmek', 10.00, 'adet', 300, false, 'Günlük taze ekmek'),
(4, 'Un 2kg', 'un-2kg', 49.90, 'adet', 80, false, 'Genel amaçlı buğday unu 2kg'),
(4, 'Ayçiçek Yağı 2L', 'aycicek-yagi-2l', 129.90, 'adet', 50, false, 'Rafine ayçiçek yağı 2 litre'),
(5, 'Çikolata Bar', 'cikolata-bar', 19.90, 'adet', 150, false, 'Sütlü çikolata bar'),
(6, 'Su 1.5L', 'su-1-5l', 9.90, 'adet', 500, false, 'Doğal kaynak suyu 1.5 litre'),
(6, 'Kola 1L', 'kola-1l', 29.90, 'adet', 200, false, 'Gazlı kola içecek 1 litre'),
(7, 'Bulaşık Deterjanı 1L', 'bulasik-deterjani-1l', 59.90, 'adet', 60, false, 'Sıvı bulaşık deterjanı 1 litre'),
(8, 'Şampuan 400ml', 'sampuan-400ml', 79.90, 'adet', 40, false, 'Günlük bakım şampuanı 400ml'),
(10, 'Poğaça (5li)', 'pogaca-5li', 49.90, 'adet', 30, true, 'Günlük taze peynirli poğaça 5 adet');
