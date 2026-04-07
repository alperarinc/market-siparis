'use client';

import { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import toast from 'react-hot-toast';
import Icon from '@/components/Icon';

const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Beklemede', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'CONFIRMED', label: 'Onaylandı', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'PREPARING', label: 'Hazırlanıyor', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'READY', label: 'Hazır', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'OUT_FOR_DELIVERY', label: 'Yolda', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'DELIVERED', label: 'Teslim Edildi', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'CANCELLED', label: 'İptal', color: 'bg-red-50 text-red-700 border-red-200' },
];

function getStatusInfo(value: string) { return ORDER_STATUSES.find((s) => s.value === value) || ORDER_STATUSES[0]; }

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
      .then((res) => { setOrders(res.data?.content || []); setTotalPages(res.data?.totalPages || 0); })
      .catch((err: any) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [page]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success('Sipariş durumu güncellendi');
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err: any) { toast.error(err.message); }
  };

  const filteredOrders = filterStatus ? orders.filter((o) => o.status === filterStatus) : orders;

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-surface-container-high border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center"><Icon name="local_shipping" className="text-white" size={20} /></div>
          <div><h1 className="text-xl font-headline font-bold text-on-surface">Siparişler</h1><p className="text-sm text-on-surface-variant">{orders.length} sipariş</p></div>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
        <button onClick={() => setFilterStatus('')} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition ${!filterStatus ? 'bg-primary text-white' : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/20 hover:border-primary/30'}`}>
          Tümü ({orders.length})
        </button>
        {ORDER_STATUSES.map((s) => {
          const count = orders.filter((o) => o.status === s.value).length;
          if (count === 0) return null;
          return (
            <button key={s.value} onClick={() => setFilterStatus(s.value)} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition ${filterStatus === s.value ? 'bg-primary text-white' : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/20 hover:border-primary/30'}`}>
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders */}
      <div className="space-y-3">
        {filteredOrders.map((order) => {
          const statusInfo = getStatusInfo(order.status);
          const isExpanded = expandedId === order.id;
          return (
            <div key={order.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden editorial-shadow">
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-surface-container-low/30 transition" onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm font-mono">{order.orderNumber}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.color}`}>{statusInfo.label}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-extrabold text-primary">{formatPrice(order.totalAmount)} TL</p>
                  <p className="text-[10px] text-on-surface-variant">{order.items?.length || 0} ürün</p>
                </div>
                <Icon name={isExpanded ? 'expand_less' : 'expand_more'} className="text-on-surface-variant" />
              </div>

              {isExpanded && (
                <div className="border-t border-surface-variant p-4 bg-surface-container-low/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-surface-container-lowest rounded-lg p-3 border border-outline-variant/10">
                      <h4 className="text-xs font-bold text-on-surface-variant uppercase mb-2 flex items-center gap-1"><Icon name="person" size={12} /> Müşteri</h4>
                      <p className="text-sm font-medium text-on-surface">{order.userName || 'Belirtilmemiş'}</p>
                      {order.userPhone && <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1"><Icon name="phone" size={10} /> {order.userPhone}</p>}
                    </div>
                    <div className="bg-surface-container-lowest rounded-lg p-3 border border-outline-variant/10">
                      <h4 className="text-xs font-bold text-on-surface-variant uppercase mb-2 flex items-center gap-1"><Icon name="location_on" size={12} /> Teslimat Adresi</h4>
                      <p className="text-sm text-on-surface">{order.deliveryAddress || 'Belirtilmemiş'}</p>
                    </div>
                    <div className="bg-surface-container-lowest rounded-lg p-3 border border-outline-variant/10">
                      <h4 className="text-xs font-bold text-on-surface-variant uppercase mb-2">Ödeme</h4>
                      <p className="text-sm text-on-surface">{order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Kapıda Ödeme' : order.paymentMethod || '-'}</p>
                      {order.note && <p className="text-xs text-on-surface-variant mt-1 italic">Not: {order.note}</p>}
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/10 mb-4 overflow-x-auto">
                    <table className="w-full text-sm min-w-[500px]">
                      <thead><tr className="border-b border-surface-variant">
                        <th className="text-left p-3 text-xs font-bold text-on-surface-variant">Ürün</th>
                        <th className="text-center p-3 text-xs font-bold text-on-surface-variant">Miktar</th>
                        <th className="text-right p-3 text-xs font-bold text-on-surface-variant">Birim Fiyat</th>
                        <th className="text-right p-3 text-xs font-bold text-on-surface-variant">Toplam</th>
                      </tr></thead>
                      <tbody>
                        {order.items?.map((item: any) => (
                          <tr key={item.id} className="border-b border-surface-variant/50">
                            <td className="p-3 font-medium">{item.productName}</td>
                            <td className="p-3 text-center text-on-surface-variant">{item.quantity} {item.unit}</td>
                            <td className="p-3 text-right text-on-surface-variant">{formatPrice(item.unitPrice)} TL</td>
                            <td className="p-3 text-right font-semibold">{formatPrice(item.totalPrice)} TL</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-surface-variant">
                          <td colSpan={3} className="p-3 text-right text-on-surface-variant">Ara Toplam</td>
                          <td className="p-3 text-right font-medium">{formatPrice(order.subtotal)} TL</td>
                        </tr>
                        {order.totalVat > 0 && <tr><td colSpan={3} className="p-3 text-right text-on-surface-variant">KDV</td><td className="p-3 text-right">{formatPrice(order.totalVat)} TL</td></tr>}
                        <tr><td colSpan={3} className="p-3 text-right text-on-surface-variant">Teslimat</td><td className="p-3 text-right">{order.deliveryFee > 0 ? `${formatPrice(order.deliveryFee)} TL` : 'Ücretsiz'}</td></tr>
                        <tr className="border-t border-surface-variant"><td colSpan={3} className="p-3 text-right font-headline font-bold">Genel Toplam</td><td className="p-3 text-right font-headline font-extrabold text-primary text-lg">{formatPrice(order.totalAmount)} TL</td></tr>
                      </tfoot>
                    </table>
                  </div>

                  {order.status === 'PENDING' && (
                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <span className="text-sm font-medium text-amber-800 flex-1">Bu sipariş onay bekliyor</span>
                      <button onClick={() => handleStatusChange(order.id, 'CONFIRMED')} className="px-4 py-2 bg-secondary text-white rounded-full text-sm font-bold hover:opacity-90 transition">Kabul Et</button>
                      <button onClick={() => handleStatusChange(order.id, 'CANCELLED')} className="px-4 py-2 bg-error text-white rounded-full text-sm font-bold hover:opacity-90 transition">Reddet</button>
                    </div>
                  )}
                  {order.status !== 'PENDING' && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-on-surface-variant">Durumu ilerlet:</span>
                      {order.status === 'CONFIRMED' && <button onClick={() => handleStatusChange(order.id, 'PREPARING')} className="px-4 py-2 bg-indigo-500 text-white rounded-full text-sm font-bold hover:opacity-90 transition">Hazırlanıyor</button>}
                      {order.status === 'PREPARING' && <button onClick={() => handleStatusChange(order.id, 'READY')} className="px-4 py-2 bg-purple-500 text-white rounded-full text-sm font-bold hover:opacity-90 transition">Hazır</button>}
                      {order.status === 'READY' && <button onClick={() => handleStatusChange(order.id, 'OUT_FOR_DELIVERY')} className="px-4 py-2 bg-primary-container text-white rounded-full text-sm font-bold hover:opacity-90 transition">Yola Çıktı</button>}
                      {order.status === 'OUT_FOR_DELIVERY' && <button onClick={() => handleStatusChange(order.id, 'DELIVERED')} className="px-4 py-2 bg-secondary text-white rounded-full text-sm font-bold hover:opacity-90 transition">Teslim Edildi</button>}
                      <button onClick={() => handleStatusChange(order.id, 'CANCELLED')} className="px-3 py-2 text-error text-sm font-medium hover:bg-error/5 rounded-full transition">İptal Et</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filteredOrders.length === 0 && (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-12 text-center text-on-surface-variant">
            <Icon name="local_shipping" className="text-slate-300 text-5xl mb-3" />
            <p className="font-headline font-bold">{filterStatus ? 'Bu durumda sipariş yok' : 'Henüz sipariş yok'}</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="w-10 h-10 rounded-full bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-center disabled:opacity-40 hover:border-primary/30 transition"><Icon name="chevron_left" /></button>
          <span className="px-4 py-2 text-sm text-on-surface-variant font-headline font-bold">{page + 1} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="w-10 h-10 rounded-full bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-center disabled:opacity-40 hover:border-primary/30 transition"><Icon name="chevron_right" /></button>
        </div>
      )}
    </div>
  );
}
