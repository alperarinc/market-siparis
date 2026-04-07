'use client';

import { useEffect, useState } from 'react';
import { getAdminDashboard, getAllOrders, updateOrderStatus } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import toast from 'react-hot-toast';
import { FiPackage, FiDollarSign, FiAlertTriangle, FiTruck, FiShield, FiClock } from 'react-icons/fi';

const ORDER_STATUSES = [
  'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
];

const statusLabels: Record<string, string> = {
  PENDING: 'Beklemede',
  CONFIRMED: 'Onaylandı',
  PREPARING: 'Hazırlanıyor',
  READY: 'Hazır',
  OUT_FOR_DELIVERY: 'Yolda',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal',
};

const statusColors: Record<string, string> = {
  PENDING: 'text-amber-600',
  CONFIRMED: 'text-blue-600',
  PREPARING: 'text-indigo-600',
  READY: 'text-purple-600',
  OUT_FOR_DELIVERY: 'text-brand-orange-600',
  DELIVERED: 'text-brand-green-600',
  CANCELLED: 'text-red-500',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminDashboard(), getAllOrders()])
      .then(([dashRes, ordersRes]) => {
        setStats(dashRes.data);
        setOrders(ordersRes.data?.content || []);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success('Sipariş durumu güncellendi');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-orange-100 border-t-brand-orange-500 mx-auto" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-orange-500 rounded-xl flex items-center justify-center shadow-sm">
          <FiShield className="text-white" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Köylüoğlu Fresh Yönetim Paneli</p>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<FiPackage size={20} />}
          label="Bugünkü Sipariş"
          value={stats?.todayOrders || 0}
          color="bg-brand-orange-500"
          bgColor="bg-brand-orange-50"
        />
        <StatCard
          icon={<FiDollarSign size={20} />}
          label="Bugünkü Gelir"
          value={`${formatPrice(stats?.todayRevenue || 0)} TL`}
          color="bg-brand-green-600"
          bgColor="bg-brand-green-50"
        />
        <StatCard
          icon={<FiTruck size={20} />}
          label="Haftalık Sipariş"
          value={stats?.weekOrders || 0}
          color="bg-blue-500"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<FiAlertTriangle size={20} />}
          label="Düşük Stok"
          value={stats?.lowStockCount || 0}
          color="bg-red-500"
          bgColor="bg-red-50"
        />
      </div>

      {/* SKT Yaklaşan Ürünler */}
      {stats?.expiringProducts?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <h3 className="font-bold text-amber-700 mb-3 flex items-center gap-2">
            <FiClock size={16} />
            Son Kullanma Tarihi Yaklaşan Ürünler
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

      {/* Düşük Stoklu Ürünler */}
      {stats?.lowStockProducts?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
          <h3 className="font-bold text-red-700 mb-3 flex items-center gap-2">
            <FiAlertTriangle size={16} />
            Stok Uyarısı
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.lowStockProducts.map((p: any) => (
              <span key={p.id} className="bg-white px-3 py-1.5 rounded-lg text-sm border border-red-200">
                {p.name}: <strong className="text-red-600">{p.stockQuantity}</strong> {p.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Siparişler Tablosu */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-lg">Son Siparişler</h2>
          <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-lg">{orders.length} sipariş</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Sipariş No</th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Tarih</th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Tutar</th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Durum</th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition">
                  <td className="p-4 font-mono font-bold text-sm">{order.orderNumber}</td>
                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="p-4 font-extrabold text-brand-orange-600">{formatPrice(order.totalAmount)} TL</td>
                  <td className="p-4">
                    <span className={`font-semibold text-xs ${statusColors[order.status] || 'text-gray-600'}`}>
                      {statusLabels[order.status]}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-brand-orange-500 focus:border-brand-orange-500 focus:outline-none transition"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{statusLabels[s]}</option>
                      ))}
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

function StatCard({ icon, label, value, color, bgColor }: { icon: any; label: string; value: any; color: string; bgColor: string }) {
  return (
    <div className={`${bgColor} rounded-xl p-5 border border-gray-100`}>
      <div className={`w-10 h-10 ${color} text-white rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
        {icon}
      </div>
      <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
      <p className="text-2xl font-extrabold text-gray-800">{value}</p>
    </div>
  );
}
