import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { FiSearch, FiPackage, FiTruck, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../services/api'

const OrderTracking = () => {
  const [searchParams] = useSearchParams()
  const [orderNumber, setOrderNumber] = useState(searchParams.get('orderNumber') || '')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!orderNumber.trim()) return

    setLoading(true)
    setSearched(true)

    try {
      const { data } = await api.get(`/orders/track/${orderNumber}`)
      setOrder(data)
    } catch (error) {
      setOrder(null)
      toast.error('Sipariş bulunamadı')
    } finally {
      setLoading(false)
    }
  }

  const getSteps = () => {
    const steps = [
      { id: 'pending', label: 'Sipariş Alındı', icon: FiClock },
      { id: 'paid', label: 'Ödeme Onaylandı', icon: FiCheckCircle },
      { id: 'processing', label: 'Hazırlanıyor', icon: FiPackage },
      { id: 'shipped', label: 'Kargoya Verildi', icon: FiTruck },
      { id: 'delivered', label: 'Teslim Edildi', icon: FiCheckCircle }
    ]

    const statusOrder = ['pending', 'paid', 'processing', 'shipped', 'delivered']
    const currentIndex = statusOrder.indexOf(order?.status)

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }))
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gradient-to-br from-pastel-pink-50 via-white to-baby-blue-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-gray-800 mb-4">
            Sipariş Takibi
          </h1>
          <p className="text-gray-500">
            Sipariş numaranızı girerek siparişinizin durumunu takip edebilirsiniz.
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Sipariş numaranızı girin (örn: ORD-ABC123)"
              className="w-full px-6 py-4 pr-14 rounded-2xl border border-gray-200 focus:border-pastel-pink-400 focus:ring-2 focus:ring-pastel-pink-100 outline-none text-lg"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-pastel-pink-400 to-baby-blue-400 text-white rounded-xl flex items-center justify-center hover:from-pastel-pink-500 hover:to-baby-blue-500 transition-all"
            >
              <FiSearch className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Order Details */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-pastel-pink-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-500">Aranıyor...</p>
          </div>
        ) : order ? (
          <div className="max-w-3xl mx-auto">
            {/* Order Info Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Sipariş Numarası</p>
                  <p className="text-xl font-bold text-gray-800">#{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Sipariş Tarihi</p>
                  <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>

              {/* Cancelled Order Notice */}
              {order.status === 'cancelled' ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <FiXCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-red-600 mb-2">Sipariş İptal Edildi</h3>
                  <p className="text-red-500">Bu sipariş iptal edilmiştir.</p>
                </div>
              ) : (
                /* Progress Steps */
                <div className="relative">
                  <div className="flex justify-between items-center">
                    {getSteps().map((step, index) => (
                      <div key={step.id} className="flex flex-col items-center z-10">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                          step.completed
                            ? 'bg-gradient-to-br from-pastel-pink-400 to-baby-blue-400 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          <step.icon className="w-6 h-6" />
                        </div>
                        <span className={`text-xs text-center ${
                          step.current ? 'font-semibold text-pastel-pink-500' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Progress Line */}
                  <div className="absolute top-6 left-12 right-12 h-0.5 bg-gray-200 -z-0">
                    <div 
                      className="h-full bg-gradient-to-r from-pastel-pink-400 to-baby-blue-400 transition-all duration-500"
                      style={{ 
                        width: `${(getSteps().filter(s => s.completed).length - 1) / (getSteps().length - 1) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
              <h3 className="text-lg font-semibold mb-4">Sipariş Detayları</h3>
              <div className="space-y-4">
                {order.items?.map((item, index) => {
                  const getImageUrl = (img) => {
                    if (!img) return 'https://via.placeholder.com/80'
                    if (img.startsWith('http')) return img
                    if (img.startsWith('/')) return `http://localhost:5000${img}`
                    return `http://localhost:5000/uploads/${img}`
                  }
                  return (
                    <Link 
                      key={index} 
                      to={`/urun/${item.product}`}
                      className="flex items-center gap-4 py-3 border-b last:border-0 hover:bg-gray-50 rounded-lg transition-colors -mx-2 px-2"
                    >
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium hover:text-pastel-pink-500 transition-colors">{item.name}</p>
                        <p className="text-sm text-gray-500">Adet: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">{((item.price || 0) * item.quantity).toLocaleString('tr-TR')} ₺</p>
                    </Link>
                  )
                })}
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between">
                <span className="font-semibold">Toplam</span>
                <span className="text-xl font-bold text-pastel-pink-500">
                  {order.total?.toLocaleString('tr-TR')} ₺
                </span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Teslimat Adresi</h3>
              <p className="text-gray-600">
                {order.shippingAddress?.street}, {order.shippingAddress?.district}<br />
                {order.shippingAddress?.city} {order.shippingAddress?.zipCode || ''}
              </p>
            </div>
          </div>
        ) : searched ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📦</span>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Sipariş Bulunamadı</h3>
            <p className="text-gray-500">Lütfen sipariş numaranızı kontrol edin.</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default OrderTracking