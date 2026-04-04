-- SMS bildirim ayarları
INSERT INTO site_settings (setting_key, setting_value, label) VALUES
    ('admin_phone', '', 'Admin bildirim telefon numarası'),
    ('sms_notification_enabled', 'true', 'SMS bildirimleri aktif mi'),
    ('customer_sms_enabled', 'true', 'Müşteriye SMS bildirimi gönder'),
    ('admin_sms_enabled', 'true', 'Admin telefona SMS bildirimi gönder')
ON CONFLICT (setting_key) DO NOTHING;
