'use client';

import { useEffect, useState } from 'react';
import { getAdminPages, updatePage } from '@/lib/api';
import toast from 'react-hot-toast';
import Icon from '@/components/Icon';
import Link from 'next/link';

interface PageItem {
  id: number;
  slug: string;
  title: string;
  content: string;
  active: boolean;
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '' });

  const fetchPages = () => {
    getAdminPages()
      .then((res) => setPages(res.data || []))
      .catch((err: any) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPages(); }, []);

  const handleEdit = (p: PageItem) => {
    setEditId(p.id);
    setEditForm({ title: p.title, content: p.content || '' });
  };

  const handleSave = async () => {
    if (!editId) return;
    try {
      await updatePage(editId, editForm);
      toast.success('Sayfa güncellendi');
      setEditId(null);
      fetchPages();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggle = async (p: PageItem) => {
    try {
      await updatePage(p.id, { active: !p.active });
      toast.success(p.active ? 'Sayfa gizlendi' : 'Sayfa yayınlandı');
      fetchPages();
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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
          <Icon name="description" className="text-on-primary-container" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-headline font-bold text-on-surface">Sayfalar</h1>
          <p className="text-sm text-on-surface-variant">Hakkımızda, KVKK, Kullanım Koşulları, İletişim</p>
        </div>
      </div>

      {/* Editing */}
      {editId && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-6 mb-6">
          <h3 className="font-headline font-bold text-on-surface mb-4">Sayfa Düzenle</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Başlık</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/20 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                İçerik <span className="text-on-surface-variant font-normal">(Markdown destekli: ## başlık, - liste, **kalın**)</span>
              </label>
              <textarea
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                rows={18}
                className="w-full px-4 py-3 rounded-lg border border-outline-variant/20 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary/30 resize-y"
              />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleSave} className="flex items-center gap-2 bg-primary-container text-on-primary-container px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition">
                <Icon name="check" size={16} /> Kaydet
              </button>
              <button onClick={() => setEditId(null)} className="px-5 py-2.5 rounded-full text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition">
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pages list */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 divide-y divide-outline-variant/10">
        {pages.map((p) => (
          <div key={p.id} className={`flex items-center justify-between px-6 py-4 ${!p.active ? 'opacity-50' : ''}`}>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-on-surface">{p.title}</p>
              <p className="text-xs text-on-surface-variant font-mono">/sayfa/{p.slug}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/sayfa/${p.slug}`}
                target="_blank"
                className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary-fixed transition"
              >
                <Icon name="visibility" size={16} />
              </Link>
              <button
                onClick={() => handleEdit(p)}
                className="p-2 rounded-lg text-on-surface-variant hover:text-blue-600 hover:bg-blue-50 transition"
              >
                <Icon name="edit" size={16} />
              </button>
              <button
                onClick={() => handleToggle(p)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                  p.active ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-surface-container-low text-on-surface-variant hover:opacity-90'
                }`}
              >
                {p.active ? 'Aktif' : 'Gizli'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
