import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FiUser, FiPackage, FiMapPin, FiHeart, FiSettings, FiLogOut, FiTrash2, FiShoppingBag, FiPlus, FiNavigation, FiStar, FiXCircle } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import api from '../services/api'
import { iller, getIlceler } from '../data/turkiyeIlIlce'

const Profile = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, logout, loading: authLoading, updateProfile, addAddress, deleteAddress } = useAuth()
  const { wishlistItems, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: ''
  })
  const [saving, setSaving] = useState(false)
  const [cancellingOrder, setCancellingOrder] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelOrderId, setCancelOrderId] = useState(null)
  
  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressForm, setAddressForm] = useState({
    label: 'Ev',
    street: '',
    district: '',
    city: '',
    zipCode: '',
    lat: null,
    lng: null,
    isDefault: false
  })
  const [gettingLocation, setGettingLocation] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/giris')
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/my-orders')
      setOrders(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const openCancelModal = (orderId) => {
    setCancelOrderId(orderId)
    setShowCancelModal(true)
  }

  const closeCancelModal = () => {
    setShowCancelModal(false)
    setCancelOrderId(null)
  }

  const handleCancelOrder = async () => {
    if (!cancelOrderId) return
    
    setCancellingOrder(cancelOrderId)
    setShowCancelModal(false)
    try {
      await api.put(`/orders/my-orders/${cancelOrderId}/cancel`)
      toast.success('Sipariş iptal edildi')
      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Sipariş iptal edilemedi')
    } finally {
      setCancellingOrder(null)
      setCancelOrderId(null)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(profileForm)
      toast.success('Profil güncellendi!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Güncelleme başarısız')
    } finally {
      setSaving(false)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Tarayıcınız konum özelliğini desteklemiyor')
      return
    }

    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setAddressForm(prev => ({
          ...prev,
          lat: latitude,
          lng: longitude
        }))

        // Reverse geocoding with Nominatim (free, no API key needed)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=tr`
          )
          const data = await response.json()
          
          if (data.address) {
            setAddressForm(prev => ({
              ...prev,
              street: data.address.road || data.address.pedestrian || data.address.neighbourhood || '',
              district: data.address.suburb || data.address.town || data.address.county || '',
              city: data.address.city || data.address.province || data.address.state || '',
              zipCode: data.address.postcode || ''
            }))
            toast.success('Konum alındı!')
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error)
          toast.info('Konum alındı, adres bilgilerini manuel doldurun')
        }
        
        setGettingLocation(false)
      },
      (error) => {
        setGettingLocation(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Konum izni reddedildi')
            break
          case error.POSITION_UNAVAILABLE:
            toast.error('Konum bilgisi alınamadı')
            break
          case error.TIMEOUT:
            toast.error('Konum alma zaman aşımına uğradı')
            break
          default:
            toast.error('Konum alınamadı')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await addAddress(addressForm)
      toast.success('Adres eklendi!')
      setShowAddressForm(false)
      setAddressForm({
        label: 'Ev',
        street: '',
        district: '',
        city: '',
        zipCode: '',
        lat: null,
        lng: null,
        isDefault: false
      })
    } catch (error) {
      toast.error(error.response?.data?.error || 'Adres eklenemedi')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Bu adresi silmek istediğinize emin misiniz?')) return
    
    try {
      await deleteAddress(addressId)
      toast.success('Adres silindi')
    } catch (error) {
      toast.error('Adres silinemedi')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Bekliyor' },
      paid: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Ödendi' },
      processing: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Hazırlanıyor' },
      shipped: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Kargoda' },
      delivered: { bg: 'bg-green-100', text: 'text-green-700', label: 'Teslim Edildi' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'İptal' }
    }
    const badge = badges[status] || badges.pending
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  if (authLoading) return <Loading />
  if (!user) return null

  const tabs = [
    { id: 'orders', label: 'Siparişlerim', icon: FiPackage },
    { id: 'addresses', label: 'Adreslerim', icon: FiMapPin },
    { id: 'wishlist', label: 'Favorilerim', icon: FiHeart },
    { id: 'settings', label: 'Ayarlar', icon: FiSettings }
  ]

  return (
    <div className="pt-32 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-pastel-pink-400 to-baby-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-white font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{user?.name || 'Kullanıcı'}</h2>
                <p className="text-gray-500 text-sm">{user?.email || ''}</p>
              </div>

              {/* Nav */}
              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-pastel-pink-100 to-baby-blue-100 text-pastel-pink-600'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span className="font-medium">Çıkış Yap</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Orders */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-6">Siparişlerim</h2>
                
                {loading ? (
                  <Loading />
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map(order => {
                      const getImageUrl = (img) => {
                        if (!img) return 'https://via.placeholder.com/60'
                        if (img.startsWith('http')) return img
                        if (img.startsWith('/')) return `http://localhost:5000${img}`
                        return `http://localhost:5000/uploads/${img}`
                      }
                      return (
                        <div key={order._id} className="border rounded-xl p-4">
                          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div>
                              <p className="font-medium text-gray-800">#{order.orderNumber}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                              </p>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                          
                          <div className="flex flex-wrap gap-4 mb-4">
                            {order.items.slice(0, 3).map((item, index) => (
                              <Link 
                                key={index}
                                to={`/urun/${item.product}`}
                                className="hover:opacity-80 transition-opacity"
                              >
                                <img
                                  src={getImageUrl(item.image)}
                                  alt={item.name}
                                  className="w-16 h-16 rounded-lg object-cover hover:ring-2 hover:ring-pastel-pink-400 transition-all"
                                />
                              </Link>
                            ))}
                            {order.items.length > 3 && (
                              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-pastel-pink-500">
                              {(order.total || order.totalAmount || 0).toLocaleString('tr-TR')} ₺
                            </span>
                            <div className="flex items-center gap-3">
                              {['pending', 'paid'].includes(order.status) && (
                                <button
                                  onClick={() => openCancelModal(order._id)}
                                  disabled={cancellingOrder === order._id}
                                  className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-medium disabled:opacity-50"
                                >
                                  <FiXCircle className="w-4 h-4" />
                                  {cancellingOrder === order._id ? 'İptal Ediliyor...' : 'İptal Et'}
                                </button>
                              )}
                              <Link
                                to={`/siparis-takip?orderNumber=${order.orderNumber}`}
                                className="text-baby-blue-500 hover:text-baby-blue-600 text-sm font-medium"
                              >
                                Detayları Gör →
                              </Link>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz siparişiniz yok</p>
                    <Link to="/urunler" className="btn-primary inline-block mt-4">
                      Alışverişe Başla
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Addresses */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Adreslerim</h2>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    Yeni Adres
                  </button>
                </div>

                {/* Address Form Modal */}
                {showAddressForm && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                      <h3 className="text-lg font-semibold mb-4">Yeni Adres Ekle</h3>
                      
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={gettingLocation}
                        className="w-full mb-4 py-3 border-2 border-dashed border-baby-blue-300 rounded-xl text-baby-blue-600 hover:bg-baby-blue-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <FiNavigation className={gettingLocation ? 'animate-pulse' : ''} />
                        {gettingLocation ? 'Konum alınıyor...' : 'Mevcut Konumu Kullan'}
                      </button>

                      <form onSubmit={handleAddAddress} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Adres Etiketi</label>
                          <select
                            value={addressForm.label}
                            onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                            className="input-field"
                          >
                            <option value="Ev">Ev</option>
                            <option value="İş">İş</option>
                            <option value="Diğer">Diğer</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                          <textarea
                            value={addressForm.street}
                            onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                            required
                            rows={2}
                            placeholder="Sokak, mahalle, bina no, daire..."
                            className="input-field"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">İl</label>
                          <select
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value, district: '' })}
                            required
                            className="input-field"
                          >
                            <option value="">İl Seçiniz</option>
                            {iller.map(il => (
                              <option key={il.plaka} value={il.il}>{il.il}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
                          <select
                            value={addressForm.district}
                            onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                            required
                            disabled={!addressForm.city}
                            className="input-field disabled:bg-gray-100"
                          >
                            <option value="">İlçe Seçiniz</option>
                            {getIlceler(addressForm.city).map(ilce => (
                              <option key={ilce} value={ilce}>{ilce}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Posta Kodu</label>
                          <input
                            type="text"
                            value={addressForm.zipCode}
                            onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                            className="input-field"
                          />
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                            className="w-4 h-4 text-pastel-pink-500 rounded"
                          />
                          <span className="text-sm text-gray-600">Varsayılan adres olarak ayarla</span>
                        </label>

                        {addressForm.lat && addressForm.lng && (
                          <p className="text-xs text-gray-400">
                            📍 Konum: {addressForm.lat.toFixed(6)}, {addressForm.lng.toFixed(6)}
                          </p>
                        )}

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddressForm(false)}
                            className="flex-1 btn-secondary"
                          >
                            İptal
                          </button>
                          <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 btn-primary disabled:opacity-50"
                          >
                            {saving ? 'Kaydediliyor...' : 'Kaydet'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Address List */}
                {user?.addresses?.length > 0 ? (
                  <div className="space-y-4">
                    {user.addresses.map(address => (
                      <div
                        key={address._id}
                        className={`border rounded-xl p-4 relative ${address.isDefault ? 'border-pastel-pink-300 bg-pastel-pink-50' : 'border-gray-200'}`}
                      >
                        {address.isDefault && (
                          <span className="absolute top-2 right-2 flex items-center gap-1 text-xs text-pastel-pink-600 bg-pastel-pink-100 px-2 py-1 rounded-full">
                            <FiStar className="w-3 h-3" />
                            Varsayılan
                          </span>
                        )}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-pastel-pink-100 to-baby-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FiMapPin className="w-5 h-5 text-pastel-pink-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-800">{address.label}</h4>
                            <p className="text-sm text-gray-600 mt-1">{address.street}</p>
                            <p className="text-sm text-gray-500">
                              {address.district}, {address.city} {address.zipCode}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteAddress(address._id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiMapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz kayıtlı adresiniz yok</p>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-6">Favorilerim ({wishlistItems.length})</h2>
                {wishlistItems.length === 0 ? (
                  <div className="text-center py-12">
                    <FiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz favori ürününüz yok</p>
                    <Link to="/urunler" className="btn-primary inline-block mt-4">
                      Ürünleri Keşfet
                    </Link>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlistItems.map(item => {
                      const getImageUrl = (img) => {
                        if (!img) return 'https://via.placeholder.com/300'
                        if (img.startsWith('http')) return img
                        if (img.startsWith('/')) return `http://localhost:5000${img}`
                        return `http://localhost:5000/uploads/${img}`
                      }
                      return (
                        <div key={item._id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                          <Link to={`/urunler/${item.slug}`} className="block">
                            <img
                              src={getImageUrl(item.images?.[0])}
                              alt={item.name}
                              className="w-full h-40 object-cover rounded-lg mb-3"
                            />
                            <h3 className="font-medium text-gray-800 mb-1 truncate">{item.name}</h3>
                            <p className="text-pastel-pink-500 font-semibold">
                              {(item.discountPrice || item.price).toLocaleString('tr-TR')} ₺
                            </p>
                          </Link>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => {
                                addToCart(item, 1)
                                toast.success('Sepete eklendi!')
                              }}
                              className="flex-1 bg-gradient-to-r from-pastel-pink-400 to-baby-blue-400 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 hover:from-pastel-pink-500 hover:to-baby-blue-500"
                            >
                              <FiShoppingBag className="w-4 h-4" />
                              Sepete Ekle
                            </button>
                            <button
                              onClick={() => {
                                removeFromWishlist(item._id)
                                toast.info('Favorilerden çıkarıldı')
                              }}
                              className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Settings */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-6">Hesap Ayarları</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="input-field bg-gray-50"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">E-posta adresi değiştirilemez</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="05XX XXX XX XX"
                      className="input-field"
                    />
                  </div>
                  <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                    {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiXCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Siparişi İptal Et</h3>
              <p className="text-gray-500 mb-6">Bu siparişi iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
              <div className="flex gap-3">
                <button
                  onClick={closeCancelModal}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                >
                  İptal Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile