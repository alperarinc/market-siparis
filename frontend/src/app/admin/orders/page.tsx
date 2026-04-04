'use client';

import { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import toast from 'react-hot-toast';
import { FiPackage, FiChevronDown, FiChevronUp, FiUser, FiMapPin, FiPhone } from 'react-icons/fi';

const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Beklemede', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'CONFIRMED', label: 'Onaylandı', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'PREPARING', label: 'Hazırlanıyor', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'READY', label: 'Hazır', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'OUT_FOR_DELIVERY', label: 'Yolda', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'DELIVERED', label: 'Teslim Edildi', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'CANCELLED', label: 'İptal', color: 'bg-red-50 text-red-700 border-red-200' },
];

function getStatusInfo(value: string) {
  return ORDER_STATUSES.find((s) => s.value === value) || ORDER_STATUSES[0];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const fetchOrders = () => {
    setLoading(true);
    getAllOrders(page)
      .then((res) => {
        setOrders(res.data?.content || []);
        setTotalPages(res.data?.totalPages || 0);
      })
      .catch((err: any) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [page]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success('Sipariş durumu güncellendi');
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filteredOrders = filterStatus
    ? orders.filter((o) => o.status === filterStatus)
    : orders;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-brand-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-orange-500 rounded-xl flex items-center justify-center">
            <FiPackage className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Siparişler</h1>
            <p className="text-sm text-gray-500">{orders.length} sipariş</p>
          </div>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar mb-5 pb-1">
        <button
          onClick={() => setFilterStatus('')}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            !filterStatus ? 'bg-brand-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-orange-300'
          }`}
        >
          Tümünü ({orders.length})
        </button>
        {ORDER_STATUSES.map((s) => {
          const count = orders.filter((o) => o.status === s.value).length;
          if (count === 0) return null;
          return (
            <button
              key={s.value}
              onClick={() => setFilterStatus(s.value)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterStatus === s.value ? 'bg-brand-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-orange-300'
              }`}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {filteredOrders.map((order) => {
          const statusInfo = getStatusInfo(order.status);
          const isExpanded = expandedId === order.id;

          return (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {/* Order header */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50/50 transition"
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm font-mono">{order.orderNumber}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-extrabold text-brand-orange-600">{formatPrice(order.totalAmount)} TL</p>
                  <p className="text-[10px] text-gray-400">{order.items?.length || 0} ürün</p>
                </div>
                <div className="text-gray-400">
                  {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-gray-100 p-4 bg-gray-50/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Müşteri bilgileri */}
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                        <FiUser size={12} /> Müşteri
                      </h4>
                      <p className="text-sm font-medium text-gray-800">{order.userName || 'Belirtilmemiş'}</p>
                      {order.userPhone && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <FiPhone size={10} /> {order.userPhone}
                        </p>
                      )}
                    </div>

                    {/* Teslimat adresi */}
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                        <FiMapPin size={12} /> Teslimat Adresi
                      </h4>
                      <p className="text-sm text-gray-700">{order.deliveryAddress || 'Belirtilmemiş'}</p>
                    </div>

                    {/* Odeme & not */}
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Ödeme</h4>
                      <p className="text-sm text-gray-700">
                        {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Kapıda Ödeme' : order.paymentMethod || '-'}
                      </p>
                      {order.note && (
                        <p className="text-xs text-gray-500 mt-1 italic">Not: {order.note}</p>
                      )}
                    </div>
                  </div>

                  {/* Ürünler */}
                  <div className="bg-white rounded-lg border border-gray-100 mb-4 overflow-x-auto">
                    <table className="w-full text-sm min-w-[500px]">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left p-3 text-xs font-semibold text-gray-500">Ürün</th>
                          <th className="text-center p-3 text-xs font-semibold text-gray-500">Miktar</th>
                          <th className="text-right p-3 text-xs font-semibold text-gray-500">Birim Fiyat</th>
                          <th className="text-right p-3 text-xs font-semibold text-gray-500">Toplam</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items?.map((item: any) => (
                          <tr key={item.id} className="border-b border-gray-50">
                            <td className="p-3 font-medium text-gray-800">{item.productName}</td>
                            <td className="p-3 text-center text-gray-600">{item.quantity} {item.unit}</td>
                            <td className="p-3 text-right text-gray-600">{formatPrice(item.unitPrice)} TL</td>
                            <td className="p-3 text-right font-semibold">{formatPrice(item.totalPrice)} TL</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-gray-200">
                          <td colSpan={3} className="p-3 text-right text-gray-500">Ara Toplam</td>
                          <td className="p-3 text-right font-medium">{formatPrice(order.subtotal)} TL</td>
                        </tr>
                        {order.totalVat > 0 && (
                          <tr>
                            <td colSpan={3} className="p-3 text-right text-gray-500">KDV</td>
                            <td className="p-3 text-right text-gray-600">{formatPrice(order.totalVat)} TL</td>
                          </tr>
                        )}
                        <tr>
                          <td colSpan={3} className="p-3 text-right text-gray-500">Teslimat</td>
                          <td className="p-3 text-right text-gray-600">
                            {order.deliveryFee > 0 ? `${formatPrice(order.deliveryFee)} TL` : 'Ücretsiz'}
                          </td>
                        </tr>
                        <tr className="border-t border-gray-200">
                          <td colSpan={3} className="p-3 text-right font-bold text-gray-900">Genel Toplam</td>
                          <td className="p-3 text-right font-extrabold text-brand-orange-600 text-lg">{formatPrice(order.totalAmount)} TL</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Hızlı aksiyonlar */}
                  {order.status === 'PENDING' && (
                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <span className="text-sm font-medium text-amber-800 flex-1">Bu sipariş onay bekliyor</span>
                      <button onClick={() => handleStatusChange(order.id, 'CONFIRMED')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition">Kabul Et</button>
                      <button onClick={() => handleStatusChange(order.id, 'CANCELLED')} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition">Reddet</button>
                    </div>
                  )}

                  {order.status !== 'PENDING' && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Durumu ilerlet:</span>
                      {order.status === 'CONFIRMED' && (
                        <button onClick={() => handleStatusChange(order.id, 'PREPARING')} className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 transition">Hazırlanıyor</button>
                      )}
                      {order.status === 'PREPARING' && (
                        <button onClick={() => handleStatusChange(order.id, 'READY')} className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-semibold hover:bg-purple-600 transition">Hazır</button>
                      )}
                      {order.status === 'READY' && (
                        <button onClick={() => handleStatusChange(order.id, 'OUT_FOR_DELIVERY')} className="px-4 py-2 bg-brand-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-brand-orange-600 transition">Yola Çıktı</button>
                      )}
                      {order.status === 'OUT_FOR_DELIVERY' && (
                        <button onClick={() => handleStatusChange(order.id, 'DELIVERED')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition">Teslim Edildi</button>
                      )}
                      <button onClick={() => handleStatusChange(order.id, 'CANCELLED')} className="px-3 py-2 text-red-500 text-sm font-medium hover:bg-red-50 rounded-lg transition">İptal Et</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
            <FiPackage size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium">{filterStatus ? 'Bu durumda sipariş yok' : 'Henüz sipariş yok'}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold disabled:opacity-40 hover:border-brand-orange-300 transition"
          >
            Önceki
          </button>
          <span className="px-4 py-2 text-sm text-gray-500 font-medium">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold disabled:opacity-40 hover:border-brand-orange-300 transition"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
}
