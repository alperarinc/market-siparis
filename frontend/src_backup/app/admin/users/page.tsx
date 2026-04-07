'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiUsers, FiPhone, FiUser, FiShield, FiPlus, FiEdit2, FiTrash2, FiSlash, FiCheck } from 'react-icons/fi';

const ROLES = [
  { value: 'CUSTOMER', label: 'Müşteri' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'DELIVERY_PERSON', label: 'Kurye' },
];

const api = (url: string, opts?: RequestInit) =>
  fetch(`/api${url}`, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...opts?.headers }, ...opts })
    .then((r) => r.json());

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ phone: '', fullName: '', email: '', role: 'CUSTOMER' });

  const fetchUsers = () => {
    api('/admin/users')
      .then((res) => setUsers(res.data || []))
      .catch(() => toast.error('Kullanıcılar yüklenemedi'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const resetForm = () => { setForm({ phone: '', fullName: '', email: '', role: 'CUSTOMER' }); setEditId(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api(`/admin/users/${editId}`, { method: 'PUT', body: JSON.stringify(form) });
        toast.success('Kullanıcı güncellendi');
      } else {
        await api('/admin/users', { method: 'POST', body: JSON.stringify(form) });
        toast.success('Kullanıcı oluşturuldu');
      }
      resetForm(); fetchUsers();
    } catch (err: any) { toast.error(err.message || 'Hata'); }
  };

  const handleEdit = (u: any) => {
    setForm({ phone: u.phone, fullName: u.fullName || '', email: u.email || '', role: u.role });
    setEditId(u.id); setShowForm(true);
  };

  const handleToggle = async (id: number) => {
    await api(`/admin/users/${id}/toggle`, { method: 'PATCH' });
    fetchUsers();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    await api(`/admin/users/${id}`, { method: 'DELETE' });
    toast.success('Kullanıcı silindi'); fetchUsers();
  };

  const roleInfo: Record<string, { label: string; color: string }> = {
    ADMIN: { label: 'Admin', color: 'bg-brand-orange-50 text-brand-orange-700' },
    CUSTOMER: { label: 'Müşteri', color: 'bg-blue-50 text-blue-700' },
    DELIVERY_PERSON: { label: 'Kurye', color: 'bg-green-50 text-green-700' },
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-gray-200 border-t-brand-orange-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-orange-500 rounded-xl flex items-center justify-center"><FiUsers className="text-white" size={20} /></div>
          <div><h1 className="text-xl font-bold text-gray-900">Kullanıcılar</h1><p className="text-sm text-gray-500">{users.length} kayıtlı</p></div>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-brand-orange-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-orange-600 transition">
          <FiPlus size={16} />Yeni Kullanıcı
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">{editId ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Telefon *</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" required disabled={!!editId} />
            </div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Ad Soyad</label>
              <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
            </div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">E-posta</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
            </div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white">
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="bg-brand-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-orange-600 transition">{editId ? 'Güncelle' : 'Oluştur'}</button>
              <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition">İptal</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left p-4 text-xs font-semibold text-gray-500">Kullanıcı</th>
            <th className="text-left p-4 text-xs font-semibold text-gray-500">Telefon</th>
            <th className="text-left p-4 text-xs font-semibold text-gray-500">E-posta</th>
            <th className="text-center p-4 text-xs font-semibold text-gray-500">Rol</th>
            <th className="text-center p-4 text-xs font-semibold text-gray-500">Durum</th>
            <th className="text-center p-4 text-xs font-semibold text-gray-500">İşlem</th>
          </tr></thead>
          <tbody>{users.map((u) => {
            const role = roleInfo[u.role] || roleInfo.CUSTOMER;
            return (
              <tr key={u.id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${!u.active ? 'opacity-50' : ''}`}>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      {u.role === 'ADMIN' ? <FiShield size={14} className="text-brand-orange-500" /> : <FiUser size={14} className="text-gray-400" />}
                    </div>
                    <span className="font-medium text-gray-900">{u.fullName || 'Belirtilmemiş'}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-600"><FiPhone size={12} className="inline mr-1 text-gray-400" />{u.phone}</td>
                <td className="p-4 text-gray-500">{u.email || '-'}</td>
                <td className="p-4 text-center"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${role.color}`}>{role.label}</span></td>
                <td className="p-4 text-center">
                  <button onClick={() => handleToggle(u.id)} className={`text-xs font-semibold px-2.5 py-1 rounded-full transition ${u.active ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                    {u.active ? <><FiCheck size={12} className="inline mr-1" />Aktif</> : <><FiSlash size={12} className="inline mr-1" />Engelli</>}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => handleEdit(u)} className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"><FiEdit2 size={14} /></button>
                    <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition"><FiTrash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </div>
  );
}
