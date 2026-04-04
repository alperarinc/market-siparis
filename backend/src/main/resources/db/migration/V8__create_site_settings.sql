CREATE TABLE site_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value VARCHAR(500) NOT NULL,
    label VARCHAR(200)
);

INSERT INTO site_settings (setting_key, setting_value, label) VALUES
('free_delivery_min', '200', 'Ucretsiz teslimat minimum tutar (TL)'),
('free_delivery_enabled', 'true', 'Ucretsiz teslimat aktif mi'),
('same_day_enabled', 'true', 'Ayni gun teslimat aktif mi'),
('same_day_cutoff', '14:00', 'Ayni gun teslimat son siparis saati'),
('delivery_fee', '29.90', 'Teslimat ucreti (TL)'),
('min_order_amount', '50', 'Minimum siparis tutari (TL)'),
('store_phone', '0850 XXX XX XX', 'Magaza telefonu'),
('store_city', 'Tokat Merkez', 'Magaza sehir');
