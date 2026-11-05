import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiShoppingBag, FiUser, FiMenu, FiX, FiHeart, FiSearch } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import api from '../services/api'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [categories, setCategories] = useState([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories')
      setCategories(data)
    } catch (error) {
      console.error('Kategoriler yüklenemedi')
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/urunler?search=${searchQuery}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-transparent'
    }`}>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-pastel-pink-400 to-baby-blue-400 text-white text-sm py-2">
        <div className="container mx-auto px-4 text-center">
          <span className="font-light">✨ Ücretsiz kargo için 500₺ ve üzeri alışveriş yapın ✨</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pastel-pink-400 to-baby-blue-400 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">🎀</span>
            </div>
            <span className="text-2xl font-display font-bold gradient-text">
              El Yapımı
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-pastel-pink-500 transition-colors font-medium">
              Ana Sayfa
            </Link>
            <div className="relative group">
              <Link to="/urunler" className="text-gray-700 hover:text-pastel-pink-500 transition-colors font-medium flex items-center">
                Ürünler
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              {/* Dropdown */}
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="p-4">
                  {categories.map(category => (
                    <Link
                      key={category._id}
                      to={`/urunler?category=${category.slug}`}
                      className="block py-2 px-3 text-gray-600 hover:text-pastel-pink-500 hover:bg-pastel-pink-50 rounded-lg transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link to="/siparis-takip" className="text-gray-700 hover:text-pastel-pink-500 transition-colors font-medium">
              Sipariş Takip
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button 
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-gray-600 hover:text-pastel-pink-500 transition-colors"
            >
              <FiSearch className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link to="/profil?tab=wishlist" className="relative p-2 text-gray-600 hover:text-pastel-pink-500 transition-colors hidden md:block">
              <FiHeart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pastel-pink-400 to-pastel-pink-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/sepet" className="relative p-2 text-gray-600 hover:text-pastel-pink-500 transition-colors">
              <FiShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pastel-pink-400 to-pastel-pink-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-pastel-pink-500 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-pastel-pink-300 to-baby-blue-300 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </button>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="p-4">
                    <p className="text-sm text-gray-500 mb-2">Merhaba, {user.name || 'Kullanıcı'}</p>
                    <Link to="/profil" className="block py-2 px-3 text-gray-600 hover:text-pastel-pink-500 hover:bg-pastel-pink-50 rounded-lg transition-colors">
                      Profilim
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left py-2 px-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/giris" className="hidden md:flex items-center space-x-2 btn-primary text-sm py-2 px-4">
                <FiUser className="w-4 h-4" />
                <span>Giriş Yap</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600"
            >
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="pb-4 animate-fadeIn">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ürün ara..."
                className="w-full input-field pl-12"
                autoFocus
              />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-6 space-y-4">
            <Link to="/" className="block py-2 text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>
              Ana Sayfa
            </Link>
            <Link to="/urunler" className="block py-2 text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>
              Ürünler
            </Link>
            {categories.map(category => (
              <Link
                key={category._id}
                to={`/urunler?category=${category.slug}`}
                className="block py-2 pl-4 text-gray-500"
                onClick={() => setIsMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
            <Link to="/siparis-takip" className="block py-2 text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>
              Sipariş Takip
            </Link>
            {!user && (
              <Link to="/giris" className="block py-2 text-pastel-pink-500 font-medium" onClick={() => setIsMenuOpen(false)}>
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header