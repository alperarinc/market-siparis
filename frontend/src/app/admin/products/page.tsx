'use client';

import { useEffect, useState } from 'react';
import { getAdminProducts, getAdminCategories, createProduct, updateProduct, deleteProduct } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import toast from 'react-hot-toast';
import Icon from '@/components/Icon';

const EMPTY_FORM = {
  name: '', description: '', barcode: '', price: '', discountedPrice: '',
  unit: 'adet', stockQuantity: '0', minStockLevel: '5', imageUrl: '',
  featured: false, categoryId: '', brand: '', origin: '', weightInfo: '',
  storageConditions: '', ingredients: '', expiryDate: '', priceIncludesVat: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState<'all' | 'low-stock' | 'expiring'>('all');

  const fetchAll = () => {
    Promise.all([getAdminProducts(), getAdminCategories()])
      .then(([pRes, cRes]) => { setProducts(pRes.data || []); setCategories(cRes.data || []); })
      .catch((err: any) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const resetForm = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(false); };

  const handleEdit = (p: any) => {
    setForm({
      name: p.name, description: p.description || '', barcode: p.barcode || '',
      price: String(p.price), discountedPrice: p.discountedPrice ? String(p.discountedPrice) : '',
      unit: p.unit, stockQuantity: String(p.stockQuantity), minStockLevel: String(p.minStockLevel),
      imageUrl: p.imageUrl || '', featured: p.featured, categoryId: String(p.categoryId),
      brand: p.brand || '', origin: p.origin || '', weightInfo: p.weightInfo || '',
      storageConditions: p.storageConditions || '', ingredients: p.ingredients || '',
      expiryDate: p.expiryDate || '', priceIncludesVat: p.priceIncludesVat ?? true,
    });
    setEditId(p.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form, price: parseFloat(form.price),
      discountedPrice: form.discountedPrice ? parseFloat(form.discountedPrice) : null,
      stockQuantity: parseInt(form.stockQuantity), minStockLevel: parseInt(form.minStockLevel),
      categoryId: parseInt(form.categoryId), expiryDate: form.expiryDate || null,
    };
    try {
      if (editId) { await updateProduct(editId, data); toast.success('Ürün güncellendi'); }
      else { await createProduct(data); toast.success('Ürün oluşturuldu'); }
      resetForm(); fetchAll();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    try { await deleteProduct(id); toast.success('Ürün silindi'); fetchAll(); }
    catch (err: any) { toast.error(err.message); }
  };

  const filtered = products.filter((p: any) => {
    if (filter === 'low-stock') return p.stockQuantity <= p.minStockLevel;
    if (filter === 'expiring') return p.expiringSoon || p.expired;
    return true;
  });

  const f = (key: string, val: any) => setForm({ ...form, [key]: val });

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-outline-variant/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center"><Icon name="inventory_2" className="text-on-primary-container" size={20} /></div>
          <div><h1 className="text-xl font-headline font-bold text-on-surface">Ürünler</h1><p className="text-sm text-on-surface-variant">{products.length} ürün</p></div>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition"><Icon name="add" size={16} />Yeni Ürün</button>
      </div>

      {showForm && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-6 mb-6">
          <h3 className="font-headline font-bold text-on-surface mb-4">{editId ? 'Ürün Düzenle' : 'Yeni Ürün'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div><label className="block text-xs font-medium text-on-surface-variant mb-1">Ürün Adı *</label><input type="text" value={form.name} onChange={(e) => f('name', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant/20 text-sm" required /></div>
            <div><label className="block text-xs font-medium text-on-surface-variant mb-1">Kategori *</label>
              <select value={form.categoryId} onChange={(e) => f('categoryId', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant/20 text-sm bg-surface-container-lowest" required>
                <option value="">Seçin</option>{categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select></div>
            <div><label className="block text-xs font-medium text-on-surface-variant mb-1">Fiyat (TL) *</label><input type="number" step="0.001" value={form.price} onChange={(e) => f('price', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant/20 text-sm" required /></div>
            <div><label className="block text-xs font-medium text-on-surface-variant mb-1">İndirimli Fiyat</label><input type="number" step="0.001" value={form.discountedPrice} onChange={(e) => f('discountedPrice', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant/20 text-sm" /></div>
            <div><label className="block text-xs font-medium text-on-surface-variant mb-1">Birim</label><input type="text" value={form.unit} onChange={(e) => f('unit', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant/20 text-sm" /></div>
            <div><label className="block text-xs font-medium text-on-surface-variant mb-1">Stok</label><input type="number" value={form.stockQuantity} onChange={(e) => f('stockQuantity', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant/20 text-sm" /></div>
            <div><label className="block text-xs font-medium text-on-surface-variant mb-1">Marka</label><input type="text" value={form.brand} onChange={(e) => f('brand', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant/20 text-sm" /></div>
            <div><label className="block text-xs font-medium text-on-surface-variant mb-1">Menşei</label><input type="text" value={form.origin} onChange={(e) => f('origin', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant/20 text-sm" /></div>
            <div><label className="block text-xs font-medium text-on-surface-variant mb-1">Ağırlık</label><input type="text" value={form.weightInfo} onChange={(e) => f('weightInfo', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant/20 text-sm" /></div>
            <div><label className="block text-xs font-medium text-on-surface-variant mb-1">Barkod</label><input type="text" value={form.barcode} onChange={(e) => f('barcode', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant/20 text-sm" /></div>
            <div><label className="block text-xs font-medium text-on-surface-variant mb-1">SKT</label><input type="date" value={form.expiryDate} onChange={(e) => f('expiryDate', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant/20 text-sm" /></div>
            <div><label className="block text-xs font-medium text-on-surface-variant mb-1">Görsel URL</label><input type="text" value={form.imageUrl} onChange={(e) => f('imageUrl', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant/20 text-sm" /></div>
            <div className="md:col-span-3"><label className="block text-xs font-medium text-on-surface-variant mb-1">Açıklama</label><textarea value={form.description} onChange={(e) => f('description', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-outline-variant/20 text-sm resize-none" /></div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.featured} onChange={(e) => f('featured', e.target.checked)} className="rounded" />Öne Çıkan</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.priceIncludesVat} onChange={(e) => f('priceIncludesVat', e.target.checked)} className="rounded" />KDV Dahil</label>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition">{editId ? 'Güncelle' : 'Oluştur'}</button>
              <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-full text-sm text-on-surface-variant hover:bg-surface-container-low transition">İptal</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-2 mb-5">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === 'all' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/20'}`}>Tümü ({products.length})</button>
        <button onClick={() => setFilter('low-stock')} className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition ${filter === 'low-stock' ? 'bg-red-500 text-white' : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/20'}`}><Icon name="warning" size={12} />Düşük Stok</button>
        <button onClick={() => setFilter('expiring')} className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition ${filter === 'expiring' ? 'bg-amber-500 text-white' : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/20'}`}><Icon name="schedule" size={12} />SKT Yaklaşan</button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead><tr className="bg-surface-container-low border-b border-outline-variant/20">
            <th className="text-left p-3 text-xs font-semibold text-on-surface-variant">Ürün</th>
            <th className="text-left p-3 text-xs font-semibold text-on-surface-variant">Kategori</th>
            <th className="text-right p-3 text-xs font-semibold text-on-surface-variant">Fiyat</th>
            <th className="text-center p-3 text-xs font-semibold text-on-surface-variant">Stok</th>
            <th className="text-center p-3 text-xs font-semibold text-on-surface-variant">SKT</th>
            <th className="text-center p-3 text-xs font-semibold text-on-surface-variant">İşlem</th>
          </tr></thead>
          <tbody>{filtered.map((p: any) => (
            <tr key={p.id} className={`border-b border-outline-variant/10 hover:bg-surface-container-low/50 ${!p.active ? 'opacity-40' : ''}`}>
              <td className="p-3"><p className="font-semibold text-on-surface">{p.name}</p>{p.featured && <span className="text-[10px] text-primary font-medium">Öne Çıkan</span>}</td>
              <td className="p-3 text-on-surface-variant text-xs">{p.categoryName}</td>
              <td className="p-3 text-right font-semibold text-primary">{formatPrice(p.price)} TL</td>
              <td className="p-3 text-center"><span className={`font-bold ${p.stockQuantity <= p.minStockLevel ? 'text-red-500' : 'text-on-surface'}`}>{p.stockQuantity}</span></td>
              <td className="p-3 text-center text-xs"><span className={p.expired ? 'text-red-500 font-bold' : p.expiringSoon ? 'text-amber-500' : 'text-on-surface-variant'}>{p.expiryDate || '-'}</span></td>
              <td className="p-3"><div className="flex items-center justify-center gap-1">
                <button onClick={() => handleEdit(p)} className="p-1.5 rounded text-on-surface-variant hover:text-blue-600 hover:bg-blue-50 transition"><Icon name="edit" size={14} /></button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded text-on-surface-variant hover:text-red-600 hover:bg-red-50 transition"><Icon name="delete" size={14} /></button>
              </div></td>
            </tr>
          ))}</tbody>
        </table>
        {filtered.length === 0 && <div className="p-12 text-center text-on-surface-variant"><Icon name="inventory_2" size={32} className="mx-auto mb-2 text-on-surface-variant" /><p>Ürün yok</p></div>}
      </div>
    </div>
  );
}
