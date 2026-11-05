import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getOrder, updateOrderStatus } from '../services/api';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await getOrder(id);
      setOrder(res.data);
    } catch (error) {
      console.error('Fetch error:', error);
      // Demo data
      setOrder({
        _id: id,
        orderNumber: 'ORD-2024-001',
        user: {
          name: 'Ayşe Yılmaz',
          email: 'ayse@example.com',
          phone: '0532 123 45 67'
        },
        items: [
          { product: { name: 'Vintage Ahşap Çerçeve', images: [] }, quantity: 2, price: 150 },
          { product: { name: 'Cam Kavanoz Seti', images: [] }, quantity: 1, price: 80 },
        ],
        totalAmount: 380,
        status: 'processing',
        createdAt: new Date().toISOString(),
        shippingAddress: {
          fullName: 'Ayşe Yılmaz',
          address: 'Atatürk Cad. No:123 D:5',
          city: 'İstanbul',
          district: 'Kadıköy',
          postalCode: '34710',
          phone: '0532 123 45 67'
        },
        paymentMethod: 'credit_card',
        notes: 'Lütfen dikkatli paketleyin.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      setOrder({ ...order, status: newStatus });
      toast.success('Siparis durumu güncellendi');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Durum güncellenemedi');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
      paid: { label: 'Ödendi', color: 'bg-blue-100 text-blue-700', icon: '💳' },
      processing: { label: 'Hazırlanıyor', color: 'bg-purple-100 text-purple-700', icon: '📦' },
      shipped: { label: 'Kargoda', color: 'bg-primary-100 text-primary-700', icon: '🚚' },
      delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-700', icon: '✅' },
      cancelled: { label: 'İptal Edildi', color: 'bg-red-100 text-red-700', icon: '❌' },
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700', icon: '📋' };
  };

  const statusSteps = ['pending', 'paid', 'processing', 'shipped', 'delivered'];
  const currentStepIndex = statusSteps.indexOf(order?.status);

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

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Sipariş bulunamadı</p>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{order.orderNumber}</h1>
            <p className="text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full ${statusInfo.color} font-medium flex items-center gap-2`}>
          <span>{statusInfo.icon}</span>
          <span>{statusInfo.label}</span>
        </div>
      </div>

      {/* Progress */}
      {order.status !== 'cancelled' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Sipariş Durumu</h3>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-primary-400 to-accent-400 rounded-full transition-all duration-500"
                style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
              ></div>
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => {
                const stepInfo = getStatusInfo(step);
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return (
                  <div key={step} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg z-10
                      ${isCompleted 
                        ? 'bg-gradient-to-br from-primary-400 to-accent-400 text-white shadow-lg' 
                        : 'bg-gray-200 text-gray-400'
                      }
                      ${isCurrent ? 'ring-4 ring-primary-100' : ''}
                    `}>
                      {stepInfo.icon}
                    </div>
                    <span className={`mt-3 text-sm font-medium ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                      {stepInfo.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-wrap gap-3 justify-center items-center">
            {/* Durum Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Durum Değiştir:</label>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-white cursor-pointer"
              >
                <option value="pending">⏳ Beklemede</option>
                <option value="paid">💳 Ödendi</option>
                <option value="processing">📦 Hazırlanıyor</option>
                <option value="shipped">🚚 Kargoda</option>
                <option value="delivered">✅ Teslim Edildi</option>
                <option value="cancelled">❌ İptal Edildi</option>
              </select>
            </div>

            <div className="w-px h-8 bg-gray-300 hidden sm:block"></div>

            {/* Quick Action Buttons */}
            {order.status === 'pending' && (
              <button
                onClick={() => handleStatusChange('processing')}
                className="btn-secondary"
              >
                Hazırlamaya Başla
              </button>
            )}
            {order.status === 'processing' && (
              <button
                onClick={() => handleStatusChange('shipped')}
                className="btn-primary"
              >
                Kargoya Ver
              </button>
            )}
            {order.status === 'shipped' && (
              <button
                onClick={() => handleStatusChange('delivered')}
                className="btn-success"
              >
                Teslim Edildi
              </button>
            )}
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <button
                onClick={() => handleStatusChange('cancelled')}
                className="btn-outline text-red-500 border-red-300 hover:bg-red-50"
              >
                İptal Et
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Sipariş Ürünleri</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {order.items?.map((item, index) => {
              const itemName = item.name || item.product?.name || 'Ürün'
              const itemImage = item.image || item.product?.images?.[0]
              const getImageUrl = (img) => {
                if (!img) return null
                if (img.startsWith('http')) return img
                return `http://localhost:5000/uploads/${img}`
              }
              return (
                <div key={index} className="p-6 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {itemImage ? (
                      <img
                        src={getImageUrl(itemImage)}
                        alt={itemName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">🎨</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{itemName}</p>
                    <p className="text-sm text-gray-500">Adet: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">₺{((item.price || 0) * item.quantity).toLocaleString('tr-TR')}</p>
                    <p className="text-sm text-gray-500">₺{item.price || 0} / adet</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">Toplam</span>
              <span className="text-2xl font-bold text-primary-500">
                ₺{(order.total || order.totalAmount || 0).toLocaleString('tr-TR')}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Müşteri Bilgileri</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-500 font-medium">
                    {(order.customerInfo?.name || order.user?.name || 'M')?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{order.customerInfo?.name || order.user?.name}</p>
                  <p className="text-sm text-gray-500">{order.customerInfo?.email || order.user?.email}</p>
                </div>
              </div>
              {(order.customerInfo?.phone || order.user?.phone) && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-sm">{order.customerInfo?.phone || order.user?.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Teslimat Adresi</h3>
            <div className="text-gray-600 text-sm space-y-1">
              <p className="font-medium text-gray-800">{order.customerInfo?.name || order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.street || order.shippingAddress?.address}</p>
              <p>{order.shippingAddress?.district}, {order.shippingAddress?.city}</p>
              <p>{order.shippingAddress?.zipCode || order.shippingAddress?.postalCode}</p>
              <p className="pt-2">{order.customerInfo?.phone || order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Payment */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ödeme</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                {order.paymentMethod === 'cash_on_delivery' ? (
                  <span className="text-xl">💵</span>
                ) : (
                  <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {order.paymentMethod === 'cash_on_delivery' ? 'Kapıda Ödeme' : 
                   order.paymentMethod === 'iyzico' ? 'Kredi Kartı (iyzico)' : 
                   order.paymentMethod === 'credit_card' ? 'Kredi Kartı' : 'Kapıda Ödeme'}
                </p>
                <p className={`text-sm ${order.paymentStatus === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
                  {order.paymentStatus === 'completed' ? 'Ödendi' : 
                   order.paymentMethod === 'cash_on_delivery' ? 'Teslimatta ödenecek' : 'Bekliyor'}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Sipariş Notu</h3>
              <p className="text-gray-600 text-sm bg-gray-50 p-4 rounded-lg">
                {order.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;