import { Link } from 'react-router-dom'
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowLeft } from 'react-icons/fi'
import { useCart } from '../context/CartContext'

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart()

  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/120'
    if (image.startsWith('http')) return image
    if (image.startsWith('/')) return `http://localhost:5000${image}`
    return `http://localhost:5000/uploads/${image}`
  }

  if (cartItems.length === 0) {
    return (
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-pastel-pink-100 to-baby-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <FiShoppingBag className="w-16 h-16 text-pastel-pink-400" />
            </div>
            <h1 className="text-3xl font-display font-bold text-gray-800 mb-4">
              Sepetiniz Boş
            </h1>
            <p className="text-gray-500 mb-8">
              Henüz sepetinize ürün eklemediniz. Hemen alışverişe başlayın!
            </p>
            <Link to="/urunler" className="btn-primary inline-flex items-center gap-2">
              <FiShoppingBag />
              Alışverişe Başla
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-display font-bold text-gray-800 mb-8">
          Sepetim ({cartItems.length} ürün)
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div key={item._id} className="bg-white rounded-2xl p-6 shadow-sm flex gap-6">
                {/* Image */}
                <Link to={`/urunler/${item.slug}`} className="flex-shrink-0">
                  <img
                    src={getImageUrl(item.images?.[0])}
                    alt={item.name}
                    className="w-28 h-28 object-cover rounded-xl"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link to={`/urunler/${item.slug}`}>
                    <h3 className="font-semibold text-gray-800 mb-1 hover:text-pastel-pink-500 transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  {item.category && (
                    <p className="text-sm text-gray-500 mb-3">{item.category.name}</p>
                  )}
                  
                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    {item.discountPrice ? (
                      <>
                        <span className="text-lg font-bold text-pastel-pink-500">
                          {item.discountPrice.toLocaleString('tr-TR')} ₺
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {item.price.toLocaleString('tr-TR')} ₺
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-800">
                        {item.price.toLocaleString('tr-TR')} ₺
                      </span>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <FiMinus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-800">
                    {((item.discountPrice || item.price) * item.quantity).toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              </div>
            ))}

            {/* Actions */}
            <div className="flex justify-between items-center pt-4">
              <Link to="/urunler" className="flex items-center gap-2 text-gray-600 hover:text-pastel-pink-500 transition-colors">
                <FiArrowLeft />
                Alışverişe Devam Et
              </Link>
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-600 transition-colors"
              >
                Sepeti Temizle
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Sipariş Özeti</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Ara Toplam</span>
                  <span>{cartTotal.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Kargo</span>
                  <span className={cartTotal >= 500 ? 'text-green-500' : ''}>
                    {cartTotal >= 500 ? 'Ücretsiz' : '29,90 ₺'}
                  </span>
                </div>
                {cartTotal < 500 && (
                  <div className="bg-pastel-pink-50 rounded-xl p-4">
                    <p className="text-sm text-pastel-pink-600">
                      🚚 Ücretsiz kargo için <strong>{(500 - cartTotal).toLocaleString('tr-TR')} ₺</strong> daha alışveriş yapın!
                    </p>
                    <div className="w-full bg-pastel-pink-100 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-pastel-pink-400 to-baby-blue-400 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((cartTotal / 500) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Toplam</span>
                  <span className="text-pastel-pink-500">
                    {(cartTotal + (cartTotal >= 500 ? 0 : 29.90)).toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              </div>

              <Link to="/odeme" className="w-full btn-primary flex items-center justify-center gap-2">
                Ödemeye Geç
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-center gap-4 text-gray-400">
                  <span className="text-xs">🔒 SSL Güvenlik</span>
                  <span className="text-xs">💳 Güvenli Ödeme</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart