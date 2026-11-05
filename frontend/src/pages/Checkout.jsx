import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiMapPin, FiCreditCard, FiCheck, FiHome } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { iller, getIlceler } from '../data/turkiyeIlIlce'

const Checkout = () => {
  const navigate = useNavigate()
  const { cartItems, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('online') // 'online' veya 'cash_on_delivery'
  
  // Kullanıcının varsayılan adresini bul
  const defaultAddress = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0]
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: defaultAddress?.street || '',
    district: defaultAddress?.district || '',
    city: defaultAddress?.city || '',
    zipCode: defaultAddress?.zipCode || ''
  })

  // Varsayılan adres değişirse formu güncelle
  useEffect(() => {
    if (defaultAddress && !selectedAddressId) {
      setFormData(prev => ({
        ...prev,
        street: defaultAddress.street || '',
        district: defaultAddress.district || '',
        city: defaultAddress.city || '',
        zipCode: defaultAddress.zipCode || ''
      }))
      setSelectedAddressId(defaultAddress._id)
    }
  }, [defaultAddress])

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address._id)
    setFormData(prev => ({
      ...prev,
      street: address.street,
      district: address.district,
      city: address.city,
      zipCode: address.zipCode || ''
    }))
  }

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      toast.warning('Sepetiniz boş!')
      navigate('/sepet')
    }
  }, [cartItems, navigate])

  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/60'
    if (image.startsWith('http')) return image
    if (image.startsWith('/')) return `http://localhost:5000${image}`
    return `http://localhost:5000/uploads/${image}`
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create order
      const orderData = {
        items: cartItems.map(item => ({
          productId: item._id,
          quantity: item.quantity
        })),
        shippingAddress: {
          street: formData.street,
          district: formData.district,
          city: formData.city,
          zipCode: formData.zipCode
        },
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        paymentMethod: paymentMethod === 'cash_on_delivery' ? 'cash_on_delivery' : 'iyzico'
      }

      const { data: orderResponse } = await api.post('/orders', orderData)

      // Kapıda ödeme seçildiyse
      if (paymentMethod === 'cash_on_delivery') {
        clearCart()
        toast.success('Sipariş başarıyla oluşturuldu! Kapıda ödeme yapılacaktır.')
        navigate(`/odeme/sonuc?status=success&orderNumber=${orderResponse.order.orderNumber}&payment=cash`)
        return
      }

      // Online ödeme - Initialize payment
      const { data: payment } = await api.post('/payments/initialize', {
        orderId: orderResponse.order.id
      })

      if (payment.checkoutFormContent) {
        // Redirect to iyzico checkout
        const div = document.createElement('div')
        div.innerHTML = payment.checkoutFormContent
        document.body.appendChild(div)
        
        // Execute iyzico script
        const scripts = div.getElementsByTagName('script')
        for (let script of scripts) {
          const newScript = document.createElement('script')
          newScript.text = script.text
          document.body.appendChild(newScript)
        }
      } else {
        // Demo mode - payment simulated
        clearCart()
        toast.success('Sipariş başarıyla oluşturuldu!')
        navigate(`/odeme/sonuc?status=success&orderNumber=${payment.orderNumber || orderResponse.order.orderNumber}`)
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const shipping = cartTotal >= 500 ? 0 : 29.90
  const total = cartTotal + shipping

  const steps = [
    { id: 1, name: 'Bilgiler', icon: FiUser },
    { id: 2, name: 'Adres', icon: FiMapPin },
    { id: 3, name: 'Ödeme', icon: FiCreditCard }
  ]

  // Don't render if cart is empty (prevent flash before redirect)
  if (cartItems.length === 0) {
    return (
      <div className="pt-32 pb-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Yönlendiriliyor...</p>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-display font-bold text-gray-800 text-center mb-8">
          Ödeme
        </h1>

        {/* Steps */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                  step >= s.id 
                    ? 'bg-gradient-to-r from-pastel-pink-400 to-baby-blue-400 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > s.id ? <FiCheck className="w-6 h-6" /> : <s.icon className="w-6 h-6" />}
                </div>
                <span className={`ml-2 font-medium ${step >= s.id ? 'text-gray-800' : 'text-gray-400'}`}>
                  {s.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 md:w-32 h-1 mx-4 rounded ${
                    step > s.id ? 'bg-gradient-to-r from-pastel-pink-400 to-baby-blue-400' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <h2 className="text-xl font-semibold mb-6">Kişisel Bilgiler</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="input-field"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="05XX XXX XX XX"
                        className="input-field"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full btn-primary mt-8"
                  >
                    Devam Et
                  </button>
                </div>
              )}

              {/* Step 2: Address */}
              {step === 2 && (
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <h2 className="text-xl font-semibold mb-6">Teslimat Adresi</h2>
                  
                  {/* Kayıtlı Adresler */}
                  {user?.addresses?.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Kayıtlı Adreslerim</label>
                      <div className="grid gap-3">
                        {user.addresses.map(address => (
                          <button
                            key={address._id}
                            type="button"
                            onClick={() => handleSelectAddress(address)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                              selectedAddressId === address._id
                                ? 'border-pastel-pink-400 bg-pastel-pink-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <FiHome className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{address.label}</span>
                              {address.isDefault && (
                                <span className="text-xs bg-baby-blue-100 text-baby-blue-600 px-2 py-0.5 rounded-full">
                                  Varsayılan
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {address.street}, {address.district}/{address.city}
                            </p>
                          </button>
                        ))}
                      </div>
                      <div className="border-t my-6 relative">
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-gray-400">
                          veya yeni adres girin
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
                      <textarea
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="input-field"
                        placeholder="Sokak, apartman, daire no..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">İl</label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value, district: '' })}
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">İlçe</label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        required
                        disabled={!formData.city}
                        className="input-field disabled:bg-gray-100"
                      >
                        <option value="">İlçe Seçiniz</option>
                        {getIlceler(formData.city).map(ilce => (
                          <option key={ilce} value={ilce}>{ilce}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Posta Kodu</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 btn-secondary"
                    >
                      Geri
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 btn-primary"
                    >
                      Devam Et
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <h2 className="text-xl font-semibold mb-6">Ödeme Yöntemi</h2>
                  
                  {/* Payment Method Selection */}
                  <div className="space-y-4 mb-6">
                    <label 
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'online' 
                          ? 'border-pastel-pink-400 bg-pastel-pink-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={paymentMethod === 'online'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-pastel-pink-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FiCreditCard className="w-5 h-5 text-pastel-pink-500" />
                          <span className="font-medium">Kredi/Banka Kartı</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          🔒 iyzico güvenli ödeme altyapısı ile
                        </p>
                      </div>
                    </label>

                    <label 
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'cash_on_delivery' 
                          ? 'border-pastel-pink-400 bg-pastel-pink-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={paymentMethod === 'cash_on_delivery'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-pastel-pink-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">💵</span>
                          <span className="font-medium">Kapıda Ödeme</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Nakit veya kredi kartı ile kapıda ödeme
                        </p>
                      </div>
                    </label>
                  </div>

                  {paymentMethod === 'online' && (
                    <div className="bg-baby-blue-50 rounded-xl p-4 mb-6">
                      <p className="text-baby-blue-700 text-sm">
                        Ödeme işlemi iyzico güvenli ödeme sayfasına yönlendirilecektir.
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'cash_on_delivery' && (
                    <div className="bg-yellow-50 rounded-xl p-4 mb-6">
                      <p className="text-yellow-700 text-sm">
                        ⚠️ Kapıda ödeme seçeneğinde +10₺ hizmet bedeli uygulanmaktadır.
                      </p>
                    </div>
                  )}

                  {/* Order Summary in Step 3 */}
                  <div className="border-t pt-6">
                    <h3 className="font-medium mb-4">Sipariş Özeti</h3>
                    {cartItems.map(item => (
                      <div key={item._id} className="flex justify-between py-2 text-sm">
                        <span>{item.name} x {item.quantity}</span>
                        <span>{((item.discountPrice || item.price) * item.quantity).toLocaleString('tr-TR')} ₺</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 btn-secondary"
                    >
                      Geri
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 btn-primary disabled:opacity-50"
                    >
                      {loading ? 'İşleniyor...' : paymentMethod === 'cash_on_delivery' 
                        ? `${(total + 10).toLocaleString('tr-TR')} ₺ Sipariş Ver` 
                        : `${total.toLocaleString('tr-TR')} ₺ Öde`
                      }
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Sepetiniz</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map(item => (
                  <div key={item._id} className="flex gap-4">
                    <img
                      src={getImageUrl(item.images?.[0])}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{item.name}</h4>
                      <p className="text-xs text-gray-500">Adet: {item.quantity}</p>
                      <p className="text-sm font-semibold text-pastel-pink-500">
                        {((item.discountPrice || item.price) * item.quantity).toLocaleString('tr-TR')} ₺
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Ara Toplam</span>
                  <span>{cartTotal.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Kargo</span>
                  <span className={shipping === 0 ? 'text-green-500' : ''}>
                    {shipping === 0 ? 'Ücretsiz' : `${shipping.toLocaleString('tr-TR')} ₺`}
                  </span>
                </div>
                {paymentMethod === 'cash_on_delivery' && (
                  <div className="flex justify-between text-sm">
                    <span>Kapıda Ödeme Hizmet Bedeli</span>
                    <span>10,00 ₺</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Toplam</span>
                  <span className="text-pastel-pink-500">
                    {(total + (paymentMethod === 'cash_on_delivery' ? 10 : 0)).toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout