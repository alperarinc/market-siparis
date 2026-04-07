'use client';

import { useEffect, useState } from 'react';
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api';
import toast from 'react-hot-toast';
import Icon from '@/components/Icon';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  vatRate: number | null;
  sortOrder: number;
  active: boolean;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '', vatRate: 10, sortOrder: 0 });

  const fetchCategories = () => {
    getAdminCategories()
      .then((res) => setCategories(res.data || []))
      .catch((err: any) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const resetForm = () => {
    setForm({ name: '', description: '', icon: '', vatRate: 10, sortOrder: 0 });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateCategory(editId, form);
        toast.success('Kategori güncellendi');
      } else {
        await createCategory(form);
        toast.success('Kategori oluşturuldu');
      }
      resetForm();
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEdit = (cat: Category) => {
    setForm({
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || '',
      vatRate: cat.vatRate ?? 10,
      sortOrder: cat.sortOrder,
    });
    setEditId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    try {
      await deleteCategory(id);
      toast.success('Kategori silindi');
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      await updateCategory(cat.id, { active: !cat.active });
      toast.success(cat.active ? 'Kategori pasife alındı' : 'Kategori aktif edildi');
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

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
            <Icon name="grid_view" className="text-on-primary-container" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-headline font-bold text-on-surface">Kategoriler</h1>
            <p className="text-sm text-on-surface-variant">{categories.length} kategori</p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition"
        >
          <Icon name="add" size={16} />
          Yeni Kategori
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-6 mb-6">
          <h3 className="font-headline font-bold text-on-surface mb-4">
            {editId ? 'Kategori Düzenle' : 'Yeni Kategori'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Kategori Adı *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Ikon (emoji)</label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="örnek: 🥬"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Açıklama</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">KDV Oranı (%)</label>
              <select
                value={form.vatRate}
                onChange={(e) => setForm({ ...form, vatRate: parseFloat(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-surface-container-lowest"
              >
                <option value={1}>%1 - Temel gıda</option>
                <option value={10}>%10 - Gıda</option>
                <option value={20}>%20 - Diğer</option>
              </select>
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

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/20">
              <th className="text-left p-4 font-semibold text-on-surface-variant text-xs uppercase">Sıra</th>
              <th className="text-left p-4 font-semibold text-on-surface-variant text-xs uppercase">Ikon</th>
              <th className="text-left p-4 font-semibold text-on-surface-variant text-xs uppercase">Ad</th>
              <th className="text-left p-4 font-semibold text-on-surface-variant text-xs uppercase">Slug</th>
              <th className="text-left p-4 font-semibold text-on-surface-variant text-xs uppercase">KDV</th>
              <th className="text-left p-4 font-semibold text-on-surface-variant text-xs uppercase">Durum</th>
              <th className="text-left p-4 font-semibold text-on-surface-variant text-xs uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition">
                <td className="p-4 text-on-surface-variant font-mono">{cat.sortOrder}</td>
                <td className="p-4 text-2xl">{cat.icon || '📦'}</td>
                <td className="p-4 font-semibold text-on-surface">{cat.name}</td>
                <td className="p-4 text-on-surface-variant font-mono text-xs">{cat.slug}</td>
                <td className="p-4 text-sm font-medium text-on-surface-variant">%{cat.vatRate ?? 10}</td>
                <td className="p-4">
                  <button
                    onClick={() => handleToggleActive(cat)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                      cat.active
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-surface-container-low text-on-surface-variant hover:opacity-90'
                    }`}
                  >
                    {cat.active ? <><Icon name="check" size={12} /> Aktif</> : 'Pasif'}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-2 rounded-lg text-on-surface-variant hover:text-blue-600 hover:bg-blue-50 transition"
                    >
                      <Icon name="edit" size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 rounded-lg text-on-surface-variant hover:text-red-600 hover:bg-red-50 transition"
                    >
                      <Icon name="delete" size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                  Henüz kategori eklenmemiş
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
