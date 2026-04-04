'use client';

import { useEffect, useState } from 'react';
import { getMyOrders, cancelOrder } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { FiPackage, FiChevronDown, FiChevronUp, FiClock } from 'react-icons/fi';

const STATUS_FLOW = [
  { key: 'PENDING', label: 'Onay Bekleniyor', icon: '⏳' },
  { key: 'CONFIRMED', label: 'Onaylandı', icon: '✅' },
  { key: 'PREPARING', label: 'Hazırlanıyor', icon: '👨‍🍳' },
  { key: 'READY', label: 'Hazır', icon: '📦' },
  { key: 'OUT_FOR_DELIVERY', label: 'Yolda', icon: '🚚' },
  { key: 'DELIVERED', label: 'Teslim Edildi', icon: '🎉' },
];

const statusInfo: Record<string, { label: string; color: string; icon: string }> = {
  PENDING: { label: 'Onay Bekleniyor', color: 'bg-amber-50 text-amber-700', icon: '⏳' },
  CONFIRMED: { label: 'Onaylandı', color: 'bg-blue-50 text-blue-700', icon: '✅' },
  PREPARING: { label: 'Hazırlanıyor', color: 'bg-indigo-50 text-indigo-700', icon: '👨‍🍳' },
  READY: { label: 'Hazır', color: 'bg-purple-50 text-purple-700', icon: '📦' },
  OUT_FOR_DELIVERY: { label: 'Yolda', color: 'bg-orange-50 text-orange-700', icon: '🚚' },
  DELIVERED: { label: 'Teslim Edildi', color: 'bg-green-50 text-green-700', icon: '🎉' },
  CANCELLED: { label: 'İptal Edildi', color: 'bg-red-50 text-red-700', icon: '❌' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { isAuthenticated } = useStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    getMyOrders()
      .then((res) => setOrders(res.data?.content || []))
      .catch((err: any) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleCancel = async (orderId: number) => {
    if (!confirm('Siparişi iptal etmek istediğinize emin misiniz?')) return;
    try {
      await cancelOrder(orderId);
      toast.success('Sipariş iptal edildi');
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <FiPackage size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-gray-600 font-medium mb-4">Siparişlerinizi görmek için giriş yapın</p>
        <Link href="/login" className="bg-brand-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-orange-600 transition">Giriş Yap</Link>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-gray-200 border-t-brand-orange-500 rounded-full animate-spin" /></div>;

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <FiPackage size={48} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Henüz siparişin yok</h2>
        <p className="text-gray-500 mb-6">Alışverişe başlayarak ilk siparişini oluştur!</p>
        <Link href="/products" className="bg-brand-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-orange-600 transition">Ürünlere Göz At</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <FiPackage className="text-brand-orange-500" size={24} />
        <h1 className="text-xl font-bold text-gray-900">Siparişlerim</h1>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const status = statusInfo[order.status] || statusInfo.PENDING;
          const isExpanded = expandedId === order.id;
          const currentStep = STATUS_FLOW.findIndex((s) => s.key === order.status);
          const isCancelled = order.status === 'CANCELLED';

          return (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 cursor-pointer hover:bg-gray-50/50 transition" onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm font-mono">{order.orderNumber}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.color}`}>{status.icon} {status.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-brand-orange-600">{formatPrice(order.totalAmount)} TL</span>
                    {isExpanded ? <FiChevronUp size={16} className="text-gray-400" /> : <FiChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>
                <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 p-4">
                  {/* Durum takip çubuğu */}
                  {!isCancelled && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between relative overflow-x-auto">
                        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200" />
                        <div className="absolute top-4 left-0 h-0.5 bg-brand-orange-500 transition-all" style={{ width: `${Math.max(0, (currentStep / (STATUS_FLOW.length - 1)) * 100)}%` }} />
                        {STATUS_FLOW.map((step, i) => (
                          <div key={step.key} className="flex flex-col items-center relative z-10">
                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm ${
                              i <= currentStep ? 'bg-brand-orange-500 text-white' : 'bg-gray-200 text-gray-400'
                            }`}>
                              {step.icon}
                            </div>
                            <span className={`text-[10px] mt-1 text-center max-w-[50px] sm:max-w-[60px] ${i <= currentStep ? 'text-brand-orange-600 font-semibold' : 'text-gray-400'}`}>
                              {step.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isCancelled && (
                    <div className="bg-red-50 rounded-lg p-3 mb-4 text-sm text-red-700 font-medium">
                      ❌ Bu sipariş iptal edilmiştir.
                    </div>
                  )}

                  {/* Ürünler */}
                  <div className="space-y-2 mb-4">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                        <span className="text-gray-700">{item.productName} <span className="text-gray-400">x{item.quantity}</span></span>
                        <span className="font-semibold">{formatPrice(item.totalPrice)} TL</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      Teslimat: {order.deliveryFee > 0 ? `${formatPrice(order.deliveryFee)} TL` : 'Ücretsiz'}
                      {order.totalVat > 0 && ` · KDV: ${formatPrice(order.totalVat)} TL`}
                    </div>
                    <span className="font-extrabold text-lg text-brand-orange-600">{formatPrice(order.totalAmount)} TL</span>
                  </div>

                  {(order.status === 'PENDING') && (
                    <button onClick={() => handleCancel(order.id)} className="mt-4 w-full py-2.5 rounded-lg border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition">
                      Siparişi İptal Et
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
