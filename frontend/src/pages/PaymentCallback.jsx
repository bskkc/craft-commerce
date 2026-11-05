import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { FiCheckCircle, FiXCircle, FiPackage, FiArrowRight } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import api from '../services/api'

const PaymentCallback = () => {
  const [searchParams] = useSearchParams()
  const { clearCart } = useCart()
  const [status, setStatus] = useState('loading')
  const [orderNumber, setOrderNumber] = useState('')

  useEffect(() => {
    const urlStatus = searchParams.get('status')
    const urlOrderNumber = searchParams.get('orderNumber')
    const token = searchParams.get('token')

    if (urlStatus === 'success' && urlOrderNumber) {
      setStatus('success')
      setOrderNumber(urlOrderNumber)
      clearCart()
    } else if (token) {
      verifyPayment(token)
    } else {
      setStatus('error')
    }
  }, [searchParams])

  const verifyPayment = async (token) => {
    try {
      const { data } = await api.post('/payments/verify', { token })
      if (data.status === 'success') {
        setStatus('success')
        setOrderNumber(data.orderNumber)
        clearCart()
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-pink-50 via-white to-baby-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pastel-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Ödeme doğrulanıyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-pink-50 via-white to-baby-blue-50 pt-20 pb-12 px-4">
      <div className="max-w-md w-full">
        {status === 'success' ? (
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl text-center">
            {/* Success Animation */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                <FiCheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-display font-bold text-gray-800 mb-4">
              Ödeme Başarılı! 🎉
            </h1>
            <p className="text-gray-500 mb-8">
              Siparişiniz başarıyla oluşturuldu. En kısa sürede hazırlanıp kargoya verilecektir.
            </p>

            {orderNumber && (
              <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                <p className="text-sm text-gray-500 mb-1">Sipariş Numaranız</p>
                <p className="text-2xl font-bold text-pastel-pink-500">#{orderNumber}</p>
              </div>
            )}

            <div className="space-y-4">
              <Link
                to={`/siparis-takip?orderNumber=${orderNumber}`}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <FiPackage className="w-5 h-5" />
                Siparişi Takip Et
              </Link>
              <Link
                to="/urunler"
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                Alışverişe Devam Et
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Info */}
            <div className="mt-8 pt-6 border-t text-sm text-gray-500">
              <p>Sipariş onay e-postası gönderildi.</p>
              <p>Sorularınız için: <span className="text-pastel-pink-500">info@elyapimi.com</span></p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl text-center">
            {/* Error Animation */}
            <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiXCircle className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-3xl font-display font-bold text-gray-800 mb-4">
              Ödeme Başarısız
            </h1>
            <p className="text-gray-500 mb-8">
              Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin veya farklı bir ödeme yöntemi kullanın.
            </p>

            <div className="space-y-4">
              <Link
                to="/sepet"
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                Tekrar Dene
              </Link>
              <Link
                to="/"
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                Ana Sayfaya Dön
              </Link>
            </div>

            {/* Help */}
            <div className="mt-8 pt-6 border-t text-sm text-gray-500">
              <p>Yardıma mı ihtiyacınız var?</p>
              <a href="mailto:info@elyapimi.com" className="text-pastel-pink-500 hover:underline">
                Bizimle iletişime geçin
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentCallback