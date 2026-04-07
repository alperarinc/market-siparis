'use client';

import { useEffect, useState } from 'react';
import { getAdminDashboard, getAllOrders, updateOrderStatus } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import toast from 'react-hot-toast';
import Icon from '@/components/Icon';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
const statusLabels: Record<string, string> = { PENDING: 'Beklemede', CONFIRMED: 'Onaylandı', PREPARING: 'Hazırlanıyor', READY: 'Hazır', OUT_FOR_DELIVERY: 'Yolda', DELIVERED: 'Teslim Edildi', CANCELLED: 'İptal' };
const statusColors: Record<string, string> = { PENDING: 'text-amber-600', CONFIRMED: 'text-blue-600', PREPARING: 'text-indigo-600', READY: 'text-purple-600', OUT_FOR_DELIVERY: 'text-primary-container', DELIVERED: 'text-secondary', CANCELLED: 'text-error' };

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminDashboard(), getAllOrders()])
      .then(([dashRes, ordersRes]) => { setStats(dashRes.data); setOrders(ordersRes.data?.content || []); })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      toast.success('Sipariş durumu güncellendi');
    } catch (err: any) { toast.error(err.message); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-surface-container-high border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center shadow-lg shadow-primary-container/20">
          <Icon name="shield" className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">Admin Dashboard</h1>
          <p className="text-sm text-on-surface-variant">Köylüoğlu Market Yönetim Paneli</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon="local_shipping" label="Bugünkü Sipariş" value={stats?.todayOrders || 0} color="bg-primary-container" bgColor="bg-primary-fixed" />
        <StatCard icon="payments" label="Bugünkü Gelir" value={`${formatPrice(stats?.todayRevenue || 0)} TL`} color="bg-secondary" bgColor="bg-secondary-container/30" />
        <StatCard icon="inventory_2" label="Haftalık Sipariş" value={stats?.weekOrders || 0} color="bg-blue-500" bgColor="bg-blue-50" />
        <StatCard icon="warning" label="Düşük Stok" value={stats?.lowStockCount || 0} color="bg-error" bgColor="bg-error-container" />
      </div>

      {/* Expiring products */}
      {stats?.expiringProducts?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <h3 className="font-headline font-bold text-amber-700 mb-3 flex items-center gap-2">
            <Icon name="schedule" size={16} /> SKT Yaklaşan Ürünler
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.expiringProducts.map((p: any) => (
              <span key={p.id} className={`px-3 py-1.5 rounded-lg text-sm border ${p.expired ? 'bg-red-100 border-red-300 text-red-700' : 'bg-white border-amber-200'}`}>
                {p.name}: <strong className={p.expired ? 'text-red-600' : 'text-amber-600'}>{p.expiryDate}</strong>
                {p.expired && <span className="ml-1 text-red-500 font-bold">SÜRESİ DOLDU</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Low stock */}
      {stats?.lowStockProducts?.length > 0 && (
        <div className="bg-error-container border border-red-200 rounded-xl p-5 mb-6">
          <h3 className="font-headline font-bold text-on-error-container mb-3 flex items-center gap-2">
            <Icon name="warning" size={16} /> Stok Uyarısı
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.lowStockProducts.map((p: any) => (
              <span key={p.id} className="bg-white px-3 py-1.5 rounded-lg text-sm border border-red-200">
                {p.name}: <strong className="text-error">{p.stockQuantity}</strong> {p.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Orders table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/10">
        <div className="flex items-center justify-between p-5 border-b border-surface-variant">
          <h2 className="font-headline font-bold text-lg text-on-surface">Son Siparişler</h2>
          <span className="text-xs text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-lg">{orders.length} sipariş</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="text-left p-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">Sipariş No</th>
                <th className="text-left p-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">Tarih</th>
                <th className="text-left p-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">Tutar</th>
                <th className="text-left p-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">Durum</th>
                <th className="text-left p-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} className="border-t border-surface-variant/50 hover:bg-surface-container-low/30 transition">
                  <td className="p-4 font-mono font-bold text-sm">{order.orderNumber}</td>
                  <td className="p-4 text-on-surface-variant text-sm">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</td>
                  <td className="p-4 font-extrabold text-primary">{formatPrice(order.totalAmount)} TL</td>
                  <td className="p-4"><span className={`font-semibold text-xs ${statusColors[order.status] || 'text-slate-600'}`}>{statusLabels[order.status]}</span></td>
                  <td className="p-4">
                    <select value={order.status} onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition">
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, bgColor }: { icon: string; label: string; value: any; color: string; bgColor: string }) {
  return (
    <div className={`${bgColor} rounded-xl p-5 border border-outline-variant/10`}>
      <div className={`w-10 h-10 ${color} text-white rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
        <Icon name={icon} size={20} />
      </div>
      <p className="text-xs text-on-surface-variant font-medium mb-0.5">{label}</p>
      <p className="text-2xl font-headline font-extrabold text-on-surface">{value}</p>
    </div>
  );
}
