CREATE TABLE static_pages (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

INSERT INTO static_pages (slug, title, content) VALUES
('hakkimizda', 'Hakkımızda', '## Köylüoğlu Fresh Market

Köylüoğlu Fresh, Tokat Merkez''de hizmet veren güvenilir online market alışveriş platformudur.

### Misyonumuz
Taze meyve, sebze, et, şarküteri ve günlük ihtiyaç ürünlerini en hızlı şekilde kapınıza ulaştırmak.

### Vizyonumuz
Tokat''ın en güvenilir ve en çok tercih edilen online market platformu olmak.

### Değerlerimiz
- **Tazelik**: Her gün taze ürünler
- **Güven**: Kaliteli ve hijyenik ürünler
- **Hız**: Aynı gün teslimat
- **Müşteri Memnuniyeti**: Her zaman yanınızdayız'),

('kvkk', 'KVKK Aydınlatma Metni', '## Kişisel Verilerin Korunması Hakkında Aydınlatma Metni

Köylüoğlu Fresh Market olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında kişisel verilerinizin güvenliği konusunda azami hassasiyet göstermekteyiz.

### Toplanan Kişisel Veriler
- Ad, soyad
- Telefon numarası
- Adres bilgileri
- Sipariş geçmişi

### Verilerin Kullanım Amacı
- Sipariş süreçlerinin yönetimi
- Teslimat hizmetlerinin sağlanması
- Müşteri iletişimi
- Yasal yükümlülüklerin yerine getirilmesi

### Veri Güvenliği
Kişisel verileriniz, teknik ve idari tedbirlerle korunmaktadır.

### Haklarınız
KVKK''nın 11. maddesi kapsamında; kişisel verilerinizin işlenip işlenmediğini öğrenme, düzeltme, silme ve itiraz etme haklarına sahipsiniz.

**İletişim:** info@koyluoglufresh.com'),

('kullanim-kosullari', 'Kullanım Koşulları', '## Kullanım Koşulları

Bu web sitesini kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.

### Üyelik
- Üyelik için geçerli bir telefon numarası gereklidir
- Üye bilgilerinin doğruluğundan üye sorumludur
- Hesap güvenliği kullanıcının sorumluluğundadır

### Sipariş ve Teslimat
- Siparişler Tokat Merkez ilçesi sınırları içinde teslim edilir
- Minimum sipariş tutarı uygulanabilir
- Teslimat süreleri tahminidir, garanti edilmez

### Ürünler ve Fiyatlar
- Ürün fiyatları önceden haber verilmeksizin değişebilir
- Stok durumuna göre ürün değişikliği yapılabilir
- Ürün görselleri temsilidir

### Sorumluluk
- Site kesintilerinden doğan zararlardan sorumlu değiliz
- Ürün bilgilerinde hata olması durumunda düzeltme hakkımız saklıdır'),

('iletisim', 'İletişim', '## İletişim Bilgileri

### Köylüoğlu Fresh Market

📍 **Adres**
Tokat Merkez, Tokat / Türkiye

📞 **Telefon**
0850 XXX XX XX

📧 **E-posta**
info@koyluoglufresh.com

🕐 **Çalışma Saatleri**
Pazartesi - Cumartesi: 08:00 - 22:00
Pazar: 09:00 - 21:00

### Bize Ulaşın
Sorularınız, önerileriniz veya şikayetleriniz için yukarıdaki iletişim kanallarından bize ulaşabilirsiniz.');
