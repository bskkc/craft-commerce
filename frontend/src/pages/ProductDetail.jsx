import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiShoppingBag, FiHeart, FiShare2, FiTruck, FiShield, FiRefreshCw, FiMinus, FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import Loading from '../components/Loading'
import ProductCard from '../components/ProductCard'
import api from '../services/api'

const ProductDetail = () => {
  const { slug, id } = useParams()
  const productIdentifier = slug || id
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    fetchProduct()
  }, [productIdentifier])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/products/${productIdentifier}`)
      setProduct(data)
      
      // Fetch related products
      if (data.category) {
        const { data: related } = await api.get(`/products?category=${data.category.slug}&limit=4`)
        setRelatedProducts(related.products?.filter(p => p._id !== data._id) || [])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
    toast.success(`${quantity} adet ürün sepete eklendi! 🛍️`)
  }

  const handleToggleWishlist = () => {
    const added = toggleWishlist(product)
    if (added) {
      toast.success('Favorilere eklendi! ❤️')
    } else {
      toast.info('Favorilerden çıkarıldı')
    }
  }

  const isFavorite = product ? isInWishlist(product._id) : false

  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/600x600?text=Ürün'
    if (image.startsWith('http')) return image
    if (image.startsWith('/')) return `http://localhost:5000${image}`
    return `http://localhost:5000/uploads/${image}`
  }

  if (loading) return <Loading />
  if (!product) return <div className="pt-32 text-center">Ürün bulunamadı</div>

  const discountPercentage = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0

  return (
    <div className="pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-pastel-pink-500">Ana Sayfa</Link>
          <span>/</span>
          <Link to="/urunler" className="hover:text-pastel-pink-500">Ürünler</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link to={`/urunler?category=${product.category.slug}`} className="hover:text-pastel-pink-500">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-800">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 rounded-3xl overflow-hidden">
              <img
                src={product.images?.[selectedImage] ? getImageUrl(product.images[selectedImage]) : 'https://via.placeholder.com/600'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  >
                    <FiChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  >
                    <FiChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.discountPrice && (
                  <span className="bg-pastel-pink-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                    %{discountPercentage} İndirim
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-pastel-pink-400' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            {product.category && (
              <Link to={`/urunler?category=${product.category.slug}`} className="text-baby-blue-500 font-medium text-sm uppercase tracking-wider">
                {product.category.name}
              </Link>
            )}
            
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-gray-800 mt-2 mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              {product.discountPrice ? (
                <>
                  <span className="text-3xl font-bold text-pastel-pink-500">
                    {product.discountPrice.toLocaleString('tr-TR')} ₺
                  </span>
                  <span className="text-xl text-gray-400 line-through">
                    {product.price.toLocaleString('tr-TR')} ₺
                  </span>
                  <span className="bg-pastel-pink-100 text-pastel-pink-600 px-3 py-1 rounded-full text-sm font-medium">
                    %{discountPercentage} Tasarruf
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-800">
                  {product.price.toLocaleString('tr-TR')} ₺
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-2 text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Stokta {product.stock} adet var
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-red-500">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Stokta yok
                </span>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-6 mb-8">
              <span className="font-medium text-gray-700">Adet:</span>
              <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 rounded-lg bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <FiMinus />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                  className="w-10 h-10 rounded-lg bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiShoppingBag className="w-5 h-5" />
                Sepete Ekle
              </button>
              <button 
                onClick={handleToggleWishlist}
                className={`w-14 h-14 border-2 rounded-full flex items-center justify-center transition-colors ${isFavorite ? 'border-pastel-pink-400 text-pastel-pink-500 bg-pastel-pink-50' : 'border-gray-200 text-gray-600 hover:border-pastel-pink-400 hover:text-pastel-pink-500'}`}
              >
                <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button className="w-14 h-14 border-2 border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:border-baby-blue-400 hover:text-baby-blue-500 transition-colors">
                <FiShare2 className="w-5 h-5" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 rounded-2xl">
              <div className="text-center">
                <FiTruck className="w-6 h-6 mx-auto text-pastel-pink-500 mb-2" />
                <span className="text-sm text-gray-600">Ücretsiz Kargo</span>
              </div>
              <div className="text-center">
                <FiShield className="w-6 h-6 mx-auto text-baby-blue-500 mb-2" />
                <span className="text-sm text-gray-600">Güvenli Ödeme</span>
              </div>
              <div className="text-center">
                <FiRefreshCw className="w-6 h-6 mx-auto text-pastel-pink-500 mb-2" />
                <span className="text-sm text-gray-600">Kolay İade</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-display font-bold text-gray-800 mb-8">Benzer Ürünler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default ProductDetail