'use client';

import { useEffect, useState } from 'react';
import { getAdminBanners, createBanner, updateBanner, toggleBanner, deleteBanner } from '@/lib/api';
import toast from 'react-hot-toast';
import Icon from '@/components/Icon';

interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  type: string;
  sortOrder: number;
  active: boolean;
}

const BANNER_SPECS = {
  HERO: { label: 'Ana Slider', width: 1200, height: 400, desc: 'Anasayfa ana slider görüntüsü' },
  PROMO: { label: 'Promosyon Bandı', width: 1200, height: 120, desc: 'Anasayfa üst promosyon bandı' },
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: '', imageUrl: '', linkUrl: '', type: 'HERO', sortOrder: 0 });

  const fetchBanners = () => {
    getAdminBanners()
      .then((res) => setBanners(res.data || []))
      .catch((err: any) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBanners(); }, []);

  const resetForm = () => {
    setForm({ title: '', imageUrl: '', linkUrl: '', type: 'HERO', sortOrder: 0 });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateBanner(editId, form);
        toast.success('Banner güncellendi');
      } else {
        await createBanner(form);
        toast.success('Banner oluşturuldu');
      }
      resetForm();
      fetchBanners();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEdit = (b: Banner) => {
    setForm({
      title: b.title,
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl || '',
      type: b.type,
      sortOrder: b.sortOrder,
    });
    setEditId(b.id);
    setShowForm(true);
  };

  const handleToggle = async (id: number) => {
    try {
      await toggleBanner(id);
      fetchBanners();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu banneri silmek istediğinize emin misiniz?')) return;
    try {
      await deleteBanner(id);
      toast.success('Banner silindi');
      fetchBanners();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const spec = BANNER_SPECS[form.type as keyof typeof BANNER_SPECS] || BANNER_SPECS.HERO;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-outline-variant/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
            <Icon name="image" className="text-on-primary-container" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-headline font-bold text-on-surface">Banner Yönetimi</h1>
            <p className="text-sm text-on-surface-variant">{banners.length} banner</p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition"
        >
          <Icon name="add" size={16} />
          Yeni Banner
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-6 mb-6">
          <h3 className="font-headline font-bold text-on-surface mb-4">
            {editId ? 'Banner Düzenle' : 'Yeni Banner'}
          </h3>

          {/* Dimension info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5 flex items-start gap-3">
            <Icon name="info" className="text-blue-500 mt-0.5 shrink-0" size={18} />
            <div className="text-sm">
              <p className="font-semibold text-blue-800">{spec.label} — Görsel Ölçüleri</p>
              <p className="text-blue-600">
                <strong>{spec.width} x {spec.height} px</strong> — {spec.desc}
              </p>
              <p className="text-blue-500 text-xs mt-1">
                Önerilen format: JPG veya PNG. Maksimum dosya boyutu: 2MB
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Tip *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="HERO">Ana Slider (1200x400)</option>
                <option value="PROMO">Promosyon Bandı (1200x120)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Başlık *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Banner başlığı"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                Görsel URL * <span className="text-on-surface-variant font-normal">({spec.width}x{spec.height})</span>
              </label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/banner.jpg"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Link URL <span className="text-on-surface-variant font-normal">(opsiyonel)</span></label>
              <input
                type="text"
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                placeholder="/products veya https://..."
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Sıralama</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex items-end">
              {form.imageUrl && (
                <div className="w-full">
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Önizleme</label>
                  <img src={form.imageUrl} alt="Preview" className="h-16 rounded-lg object-cover border border-outline-variant/20" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <button type="submit" className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition">
                {editId ? 'Güncelle' : 'Oluştur'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-full text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition">
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Banner list */}
      <div className="space-y-3">
        {(['HERO', 'PROMO'] as const).map((type) => {
          const typeBanners = banners.filter((b) => b.type === type);
          if (typeBanners.length === 0) return null;
          const spec = BANNER_SPECS[type];
          return (
            <div key={type}>
              <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-2">
                {spec.label}
                <span className="text-xs font-normal text-on-surface-variant">({spec.width}x{spec.height})</span>
                <span className="bg-surface-container-low text-on-surface-variant px-2 py-0.5 rounded-full text-xs">{typeBanners.length}</span>
              </h3>
              <div className="grid gap-3">
                {typeBanners.map((b) => (
                  <div key={b.id} className={`bg-surface-container-lowest rounded-xl border ${b.active ? 'border-outline-variant/20' : 'border-outline-variant/10 opacity-60'} p-4 flex items-center gap-4`}>
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className={`${type === 'HERO' ? 'w-40 h-14' : 'w-40 h-8'} object-cover rounded-lg border border-outline-variant/10`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-on-surface text-sm truncate">{b.title}</p>
                      {b.linkUrl && <p className="text-xs text-on-surface-variant truncate">{b.linkUrl}</p>}
                    </div>
                    <span className="text-xs text-on-surface-variant font-mono">#{b.sortOrder}</span>
                    <button
                      onClick={() => handleToggle(b.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                        b.active ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-surface-container-low text-on-surface-variant hover:opacity-90'
                      }`}
                    >
                      {b.active ? <><Icon name="check" size={12} className="inline mr-1" />Aktif</> : 'Pasif'}
                    </button>
                    <button onClick={() => handleEdit(b)} className="p-2 rounded-lg text-on-surface-variant hover:text-blue-600 hover:bg-blue-50 transition">
                      <Icon name="edit" size={16} />
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="p-2 rounded-lg text-on-surface-variant hover:text-red-600 hover:bg-red-50 transition">
                      <Icon name="delete" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {banners.length === 0 && (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-12 text-center text-on-surface-variant">
            <Icon name="image" size={40} className="mx-auto mb-3 text-on-surface-variant" />
            <p className="font-medium">Henüz banner eklenmemiş</p>
            <p className="text-sm">Yeni banner ekleyerek anasayfa slider'ini oluşturun</p>
          </div>
        )}
      </div>
    </div>
  );
}
