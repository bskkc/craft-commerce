import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiStar, FiTruck, FiShield, FiGift } from 'react-icons/fi'
import ProductCard from '../components/ProductCard'
import Loading from '../components/Loading'
import api from '../services/api'

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products?featured=true&limit=8'),
        api.get('/categories')
      ])
      setFeaturedProducts(productsRes.data.products || [])
      setCategories(categoriesRes.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="pt-28">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pastel-pink-50 via-white to-baby-blue-50"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-pastel-pink-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-baby-blue-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 left-1/4 text-6xl animate-bounce" style={{ animationDelay: '0.5s' }}>🌸</div>
        <div className="absolute top-1/3 right-1/3 text-4xl animate-bounce" style={{ animationDelay: '1s' }}>✨</div>
        <div className="absolute bottom-1/3 left-1/3 text-5xl animate-bounce" style={{ animationDelay: '1.5s' }}>🎀</div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              <span className="inline-block bg-gradient-to-r from-pastel-pink-100 to-baby-blue-100 text-pastel-pink-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
                ✨ El Yapımı, Gönülden
              </span>
              <h1 className="text-5xl lg:text-7xl font-display font-bold text-gray-800 mb-6 leading-tight">
                Elinizle Dokunmak
                <span className="block gradient-text">İsteyeceğiniz</span>
                Ürünler
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Her bir ürünümüz, sevgi ve özenle el yapımı olarak tasarlanmıştır. 
                Evinize sıcaklık ve doğallık katın.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/urunler" className="btn-primary inline-flex items-center justify-center gap-2">
                  Ürünleri Keşfet
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/urunler?category=yeni" className="btn-outline inline-flex items-center justify-center gap-2">
                  Yeni Gelenler
                </Link>
              </div>

              {/* Stats */}
              <div className="flex justify-center lg:justify-start gap-12 mt-12">
                <div className="text-center">
                  <p className="text-3xl font-bold gradient-text">500+</p>
                  <p className="text-sm text-gray-500">Mutlu Müşteri</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold gradient-text">100+</p>
                  <p className="text-sm text-gray-500">El Yapımı Ürün</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold gradient-text">5⭐</p>
                  <p className="text-sm text-gray-500">Müşteri Puanı</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-pastel-pink-100 to-baby-blue-100 rounded-[3rem] p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=600"
                    alt="El Yapımı Ürünler"
                    className="rounded-[2rem] shadow-2xl w-full"
                  />
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 z-20 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-pastel-pink-100 rounded-full flex items-center justify-center">
                    <FiStar className="w-6 h-6 text-pastel-pink-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">%100 El Yapımı</p>
                    <p className="text-sm text-gray-500">Özenle üretildi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-6 rounded-2xl hover:bg-pastel-pink-50 transition-colors">
              <div className="w-14 h-14 bg-gradient-to-br from-pastel-pink-400 to-pastel-pink-500 rounded-2xl flex items-center justify-center text-white">
                <FiTruck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Ücretsiz Kargo</h3>
                <p className="text-sm text-gray-500">500₺ üzeri siparişlerde</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-2xl hover:bg-baby-blue-50 transition-colors">
              <div className="w-14 h-14 bg-gradient-to-br from-baby-blue-400 to-baby-blue-500 rounded-2xl flex items-center justify-center text-white">
                <FiShield className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Güvenli Ödeme</h3>
                <p className="text-sm text-gray-500">256-bit SSL güvenlik</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-2xl hover:bg-pastel-pink-50 transition-colors">
              <div className="w-14 h-14 bg-gradient-to-br from-pastel-pink-400 to-baby-blue-400 rounded-2xl flex items-center justify-center text-white">
                <FiGift className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Hediye Paketi</h3>
                <p className="text-sm text-gray-500">Özel ambalaj seçeneği</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-pastel-pink-50 to-baby-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-pastel-pink-500 font-medium">Koleksiyonlarımız</span>
              <h2 className="text-4xl font-display font-bold text-gray-800 mt-2">Kategoriler</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <Link
                  key={category._id}
                  to={`/urunler?category=${category.slug}`}
                  className="group relative overflow-hidden rounded-3xl aspect-square"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${
                    index % 2 === 0 
                      ? 'from-pastel-pink-300 to-pastel-pink-400' 
                      : 'from-baby-blue-300 to-baby-blue-400'
                  } opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                    <span className="text-5xl mb-4">
                      {index === 0 ? '🏺' : index === 1 ? '🖼️' : index === 2 ? '🕯️' : '🎁'}
                    </span>
                    <h3 className="text-xl font-display font-semibold">{category.name}</h3>
                    <span className="mt-2 text-sm opacity-80 group-hover:opacity-100 flex items-center gap-1">
                      Keşfet <FiArrowRight />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <span className="text-baby-blue-500 font-medium">En Sevilenler</span>
              <h2 className="text-4xl font-display font-bold text-gray-800 mt-2">Öne Çıkan Ürünler</h2>
            </div>
            <Link to="/urunler" className="btn-outline mt-4 md:mt-0 flex items-center gap-2">
              Tümünü Gör <FiArrowRight />
            </Link>
          </div>
          
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Henüz ürün eklenmemiş.</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-pastel-pink-400 font-medium">Müşteri Yorumları</span>
            <h2 className="text-4xl font-display font-bold mt-2">Mutlu Müşterilerimiz</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Ayşe K.', text: 'Aldığım kavanoz muhteşemdi! Hediye ettim, çok beğenildi. Kesinlikle tekrar alışveriş yapacağım.', avatar: 'A' },
              { name: 'Fatma Y.', text: 'El işi çerçeveler gerçekten çok özel. Evime bambaşka bir hava kattı. Teşekkürler!', avatar: 'F' },
              { name: 'Zeynep M.', text: 'Hızlı kargo ve özenli paketleme. Ürünler fotoğraftakinden bile güzel çıktı!', avatar: 'Z' }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-3xl p-8">
                <div className="flex gap-1 mb-4 text-yellow-400">
                  {[...Array(5)].map((_, i) => <FiStar key={i} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pastel-pink-400 to-baby-blue-400 rounded-full flex items-center justify-center font-bold">
                    {testimonial.avatar}
                  </div>
                  <span className="font-medium">{testimonial.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-pastel-pink-400 to-baby-blue-400 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
            <div className="absolute top-10 left-10 text-6xl opacity-20">🌸</div>
            <div className="absolute bottom-10 right-10 text-6xl opacity-20">✨</div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 relative z-10">
              Özel El Yapımı Siparişler
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto relative z-10">
              Size özel, kişiselleştirilmiş el yapımı ürünler için bizimle iletişime geçin.
            </p>
            <a href="mailto:info@elyapimi.com" className="inline-flex items-center gap-2 bg-white text-pastel-pink-500 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors relative z-10">
              İletişime Geç
              <FiArrowRight />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home