import { Link } from 'react-router-dom'
import { FiHeart, FiShoppingBag, FiEye } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { toast } from 'react-toastify'

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const isFavorite = isInWishlist(product._id)

  const handleToggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const added = toggleWishlist(product)
    if (added) {
      toast.success('Favorilere eklendi! ❤️')
    } else {
      toast.info('Favorilerden çıkarıldı')
    }
  }
  
  // Görsel URL - Unsplash veya yerel dosya
  const getImageUrl = (img) => {
    if (!img) return 'https://via.placeholder.com/400x400?text=Ürün'
    if (img.startsWith('http')) return img
    // /uploads/... şeklinde gelen yollar
    if (img.startsWith('/')) return `http://localhost:5000${img}`
    return `http://localhost:5000/uploads/${img}`
  }
  
  const imageUrl = getImageUrl(product.images?.[0])

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
    toast.success('Ürün sepete eklendi! 🛍️')
  }

  const discountPercentage = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0

  return (
    <Link to={`/urunler/${product.slug}`} className="group">
      <div className="card overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.discountPrice && (
              <span className="bg-pastel-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                %{discountPercentage} İndirim
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-baby-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Öne Çıkan
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <button 
              className={`w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all ${isFavorite ? 'text-pastel-pink-500' : 'text-gray-600 hover:text-pastel-pink-500'}`}
              onClick={handleToggleFavorite}
            >
              <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button 
              className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-baby-blue-500 hover:scale-110 transition-all"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <FiEye className="w-5 h-5" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-pastel-pink-400 to-baby-blue-400 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:from-pastel-pink-500 hover:to-baby-blue-500 transition-all shadow-lg"
            >
              <FiShoppingBag className="w-5 h-5" />
              Sepete Ekle
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-xs text-baby-blue-500 font-medium uppercase tracking-wider mb-2">
            {product.category?.name}
          </p>
          <h3 className="font-display text-lg font-semibold text-gray-800 mb-3 group-hover:text-pastel-pink-500 transition-colors line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-3">
            {product.discountPrice ? (
              <>
                <span className="text-xl font-bold text-pastel-pink-500">
                  {product.discountPrice.toLocaleString('tr-TR')} ₺
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {product.price.toLocaleString('tr-TR')} ₺
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-gray-800">
                {product.price.toLocaleString('tr-TR')} ₺
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard