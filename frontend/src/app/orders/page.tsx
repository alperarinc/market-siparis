'use client';

import { useEffect, useState } from 'react';
import { getMyOrders, cancelOrder } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Icon from '@/components/Icon';

const STATUS_FLOW = [
  { key: 'PENDING', label: 'Onay Bekleniyor' },
  { key: 'CONFIRMED', label: 'Onaylandi' },
  { key: 'PREPARING', label: 'Hazirlaniyor' },
  { key: 'READY', label: 'Hazir' },
  { key: 'OUT_FOR_DELIVERY', label: 'Yolda' },
  { key: 'DELIVERED', label: 'Teslim Edildi' },
];

const statusInfo: Record<string, { label: string; bgClass: string; textClass: string; icon: string }> = {
  PENDING: { label: 'Onay Bekleniyor', bgClass: 'bg-amber-50', textClass: 'text-amber-700', icon: 'schedule' },
  CONFIRMED: { label: 'Onaylandı', bgClass: 'bg-blue-50', textClass: 'text-blue-700', icon: 'check_circle' },
  PREPARING: { label: 'Hazırlanıyor', bgClass: 'bg-indigo-50', textClass: 'text-indigo-700', icon: 'restaurant' },
  READY: { label: 'Hazır', bgClass: 'bg-purple-50', textClass: 'text-purple-700', icon: 'inventory_2' },
  OUT_FOR_DELIVERY: { label: 'Kurye Yolda', bgClass: 'bg-orange-100', textClass: 'text-orange-800', icon: 'local_shipping' },
  DELIVERED: { label: 'Teslim Edildi', bgClass: 'bg-secondary-container/30', textClass: 'text-secondary', icon: 'check_circle' },
  CANCELLED: { label: 'İptal Edildi', bgClass: 'bg-error-container', textClass: 'text-error', icon: 'cancel' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filter, setFilter] = useState('all');
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
        <Icon name="receipt_long" className="text-slate-300 text-6xl mb-4" />
        <p className="text-slate-600 font-headline font-bold mb-4">Siparişlerinizi görmek için giriş yapın</p>
        <Link href="/login" className="btn-primary inline-block">Giriş Yap</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-surface-container-high border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <Icon name="receipt_long" className="text-slate-300 text-6xl mb-4" />
        <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Henüz siparişiniz yok</h2>
        <p className="text-slate-500 mb-6">Alışverişe başlayarak ilk siparişinizi oluşturun!</p>
        <Link href="/products" className="btn-primary inline-block">Ürünlere Göz At</Link>
      </div>
    );
  }

  const filteredOrders = filter === 'all' ? orders :
    filter === 'active' ? orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status)) :
    filter === 'delivered' ? orders.filter(o => o.status === 'DELIVERED') :
    orders.filter(o => o.status === 'CANCELLED');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-headline font-black tracking-tighter text-on-surface mb-2">Siparişlerim</h1>
        <p className="text-slate-500 font-body">Tüm geçmiş ve aktif siparişlerinizi buradan takip edebilirsiniz.</p>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
        {[
          { key: 'all', label: 'Tümü' },
          { key: 'active', label: 'Devam Edenler' },
          { key: 'delivered', label: 'Tamamlananlar' },
          { key: 'cancelled', label: 'İptal Edilenler' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
              filter === f.key
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-surface-container-high text-slate-600 hover:bg-surface-container-highest'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="space-y-6">
        {filteredOrders.map((order) => {
          const status = statusInfo[order.status] || statusInfo.PENDING;
          const isExpanded = expandedId === order.id;
          const currentStep = STATUS_FLOW.findIndex((s) => s.key === order.status);
          const isCancelled = order.status === 'CANCELLED';

          return (
            <div key={order.id} className="bg-surface-container-lowest editorial-shadow rounded-xl overflow-hidden border border-slate-100 hover:scale-[1.005] transition-transform duration-300">
              {/* Header */}
              <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50 border-b border-slate-100">
                <div className="flex flex-wrap gap-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">SIPARIS TARIHI</p>
                    <p className="font-bold text-sm text-on-surface">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">TOPLAM</p>
                    <p className="font-bold text-sm text-primary">{formatPrice(order.totalAmount)} TL</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">SIPARIS NO</p>
                    <p className="font-bold text-sm text-on-surface">{order.orderNumber}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${status.bgClass} ${status.textClass}`}>
                  <Icon name={status.icon} size={14} />
                  <span className="text-xs font-bold font-label uppercase tracking-wider">{status.label}</span>
                </div>
              </div>

              {/* Content */}
              <div
                className="p-6 flex flex-col md:flex-row items-center gap-6 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
              >
                <div className="flex-grow">
                  <p className="text-sm font-body text-slate-600 mb-1">
                    {order.items?.slice(0, 2).map((item: any) => item.productName).join(', ')}
                    {order.items?.length > 2 && ` ve ${order.items.length - 2} ürün daha...`}
                  </p>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button className="px-6 py-2.5 rounded-full bg-surface-container-high text-on-surface font-bold text-sm transition-all hover:bg-surface-container-highest">
                    Detaylar
                  </button>
                  {order.status === 'DELIVERED' && (
                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-primary text-primary font-bold text-sm transition-all hover:bg-primary/5 active:scale-95">
                      <Icon name="replay" size={14} />
                      Tekrarla
                    </button>
                  )}
                  {['OUT_FOR_DELIVERY', 'CONFIRMED', 'PREPARING'].includes(order.status) && (
                    <button className="px-6 py-2.5 rounded-full bg-primary text-white font-bold text-sm shadow-sm transition-all hover:opacity-90 active:scale-95">
                      Takip Et
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-6">
                  {/* Status Progress */}
                  {!isCancelled && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between relative overflow-x-auto">
                        <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200" />
                        <div className="absolute top-4 left-0 h-0.5 bg-primary transition-all" style={{ width: `${Math.max(0, (currentStep / (STATUS_FLOW.length - 1)) * 100)}%` }} />
                        {STATUS_FLOW.map((s, i) => (
                          <div key={s.key} className="flex flex-col items-center relative z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                              i <= currentStep ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'
                            }`}>
                              {i <= currentStep ? <Icon name="check" size={14} /> : i + 1}
                            </div>
                            <span className={`text-[10px] mt-1 text-center max-w-[60px] ${i <= currentStep ? 'text-primary font-semibold' : 'text-slate-400'}`}>
                              {s.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <div className="space-y-2 mb-4">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-sm py-2 border-b border-surface-variant last:border-0">
                        <span className="text-on-surface">{item.productName} <span className="text-slate-400">x{item.quantity}</span></span>
                        <span className="font-semibold">{formatPrice(item.totalPrice)} TL</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-surface-variant">
                    <div className="text-sm text-slate-500">
                      Teslimat: {order.deliveryFee > 0 ? `${formatPrice(order.deliveryFee)} TL` : 'Ücretsiz'}
                    </div>
                    <span className="font-extrabold text-lg text-primary">{formatPrice(order.totalAmount)} TL</span>
                  </div>

                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="mt-4 w-full py-3 rounded-full border-2 border-error text-error text-sm font-bold hover:bg-error/5 transition"
                    >
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
