import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getOrders, updateOrderStatus } from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await getOrders();
      setOrders(res.data.orders || res.data);
    } catch (error) {
      console.error('Fetch error:', error);
      // Demo data
      setOrders([
        {
          _id: '1',
          orderNumber: 'ORD-2024-001',
          user: { name: 'Ayşe Yılmaz', email: 'ayse@example.com' },
          items: [{ product: { name: 'Vintage Çerçeve' }, quantity: 2, price: 150 }],
          totalAmount: 300,
          status: 'pending',
          createdAt: new Date().toISOString(),
          shippingAddress: { city: 'İstanbul' }
        },
        {
          _id: '2',
          orderNumber: 'ORD-2024-002',
          user: { name: 'Mehmet Kaya', email: 'mehmet@example.com' },
          items: [{ product: { name: 'Cam Kavanoz' }, quantity: 3, price: 80 }],
          totalAmount: 240,
          status: 'processing',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          shippingAddress: { city: 'Ankara' }
        },
        {
          _id: '3',
          orderNumber: 'ORD-2024-003',
          user: { name: 'Zeynep Demir', email: 'zeynep@example.com' },
          items: [{ product: { name: 'Lavanta Mum' }, quantity: 5, price: 45 }],
          totalAmount: 225,
          status: 'shipped',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          shippingAddress: { city: 'İzmir' }
        },
        {
          _id: '4',
          orderNumber: 'ORD-2024-004',
          user: { name: 'Ali Öztürk', email: 'ali@example.com' },
          items: [{ product: { name: 'Dekoratif Tabak' }, quantity: 1, price: 120 }],
          totalAmount: 120,
          status: 'delivered',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          shippingAddress: { city: 'Bursa' }
        },
        {
          _id: '5',
          orderNumber: 'ORD-2024-005',
          user: { name: 'Fatma Şahin', email: 'fatma@example.com' },
          items: [{ product: { name: 'El Boyama Vazo' }, quantity: 2, price: 200 }],
          totalAmount: 400,
          status: 'cancelled',
          createdAt: new Date(Date.now() - 345600000).toISOString(),
          shippingAddress: { city: 'Antalya' }
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order =>
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success('Sipariş durumu güncellendi');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Durum güncellenemedi');
    }
  };

  const statusOptions = [
    { value: '', label: 'Tüm Durumlar' },
    { value: 'pending', label: 'Beklemede' },
    { value: 'paid', label: 'Ödendi' },
    { value: 'processing', label: 'Hazırlanıyor' },
    { value: 'shipped', label: 'Kargoda' },
    { value: 'delivered', label: 'Teslim Edildi' },
    { value: 'cancelled', label: 'İptal' },
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Beklemede', class: 'badge-warning' },
      paid: { label: 'Ödendi', class: 'badge-info' },
      processing: { label: 'Hazırlanıyor', class: 'badge-info' },
      shipped: { label: 'Kargoda', class: 'badge-primary' },
      delivered: { label: 'Teslim Edildi', class: 'badge-success' },
      cancelled: { label: 'İptal', class: 'badge-danger' },
    };
    const { label, class: className } = statusMap[status] || { label: status, class: 'badge-info' };
    return <span className={`badge ${className}`}>{label}</span>;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Siparişler</h1>
        <p className="text-gray-500">Toplam {orders.length} sipariş</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Toplam</p>
            <p className="text-xl font-bold text-gray-800">{stats.total}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Beklemede</p>
            <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Hazırlanıyor</p>
            <p className="text-xl font-bold text-blue-600">{stats.processing}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Kargoda</p>
            <p className="text-xl font-bold text-primary-600">{stats.shipped}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Sipariş no veya müşteri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-full sm:w-48"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="text-left px-6 py-4">Sipariş</th>
                <th className="text-left px-6 py-4">Müşteri</th>
                <th className="text-left px-6 py-4">Tarih</th>
                <th className="text-left px-6 py-4">Tutar</th>
                <th className="text-left px-6 py-4">Durum</th>
                <th className="text-right px-6 py-4">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} className="table-row">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{order.items?.length || 0} ürün</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{order.customerInfo?.name || order.user?.name}</p>
                      <p className="text-sm text-gray-500">{order.shippingAddress?.city}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800">
                    ₺{(order.total || order.totalAmount || 0).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`text-sm font-medium px-3 py-1 rounded-full border-0 cursor-pointer
                        ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${order.status === 'paid' ? 'bg-blue-100 text-blue-700' : ''}
                        ${order.status === 'processing' ? 'bg-purple-100 text-purple-700' : ''}
                        ${order.status === 'shipped' ? 'bg-primary-100 text-primary-700' : ''}
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : ''}
                        ${order.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                      `}
                    >
                      <option value="pending">Beklemede</option>
                      <option value="paid">Ödendi</option>
                      <option value="processing">Hazırlanıyor</option>
                      <option value="shipped">Kargoda</option>
                      <option value="delivered">Teslim Edildi</option>
                      <option value="cancelled">İptal</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      <Link
                        to={`/orders/${order._id}`}
                        className="p-2 text-gray-400 hover:text-accent-500 hover:bg-accent-50 rounded-lg transition-colors"
                        title="Detay"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500">Sipariş bulunamadı</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;