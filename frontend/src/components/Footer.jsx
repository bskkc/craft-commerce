import { Link } from 'react-router-dom'
import { FiInstagram, FiFacebook, FiTwitter, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white mt-20">
      {/* Newsletter */}
      <div className="bg-gradient-to-r from-pastel-pink-400 to-baby-blue-400">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-display font-bold text-white mb-2">
              Bültenimize Abone Olun
            </h3>
            <p className="text-white/80 mb-6">
              Yeni ürünler ve özel kampanyalardan ilk siz haberdar olun
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-1 px-5 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button type="submit" className="bg-white text-pastel-pink-500 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Abone Ol
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-pastel-pink-400 to-baby-blue-400 rounded-full flex items-center justify-center">
                <span className="text-xl">🎀</span>
              </div>
              <span className="text-2xl font-display font-bold">El Yapımı</span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Her bir ürünümüz, sevgiyle ve özenle el yapımı olarak üretilmektedir. 
              Evinize doğallık ve sıcaklık katıyoruz.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-pastel-pink-400 transition-colors">
                <FiInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-baby-blue-400 transition-colors">
                <FiFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-pastel-pink-400 transition-colors">
                <FiTwitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Hızlı Linkler</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/urunler" className="text-gray-400 hover:text-pastel-pink-400 transition-colors">
                  Tüm Ürünler
                </Link>
              </li>
              <li>
                <Link to="/urunler?category=kavanozlar" className="text-gray-400 hover:text-pastel-pink-400 transition-colors">
                  Kavanozlar
                </Link>
              </li>
              <li>
                <Link to="/urunler?category=cerceveler" className="text-gray-400 hover:text-pastel-pink-400 transition-colors">
                  Çerçeveler
                </Link>
              </li>
              <li>
                <Link to="/urunler?category=dekorasyon" className="text-gray-400 hover:text-pastel-pink-400 transition-colors">
                  Dekorasyon
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Müşteri Hizmetleri</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/siparis-takip" className="text-gray-400 hover:text-pastel-pink-400 transition-colors">
                  Sipariş Takip
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-pastel-pink-400 transition-colors">
                  İade & Değişim
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-pastel-pink-400 transition-colors">
                  Kargo Bilgileri
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-pastel-pink-400 transition-colors">
                  SSS
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6">İletişim</h4>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <FiPhone className="w-5 h-5 text-pastel-pink-400" />
                <span className="text-gray-400">+90 555 123 4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiMail className="w-5 h-5 text-baby-blue-400" />
                <span className="text-gray-400">info@elyapimi.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <FiMapPin className="w-5 h-5 text-pastel-pink-400 mt-1" />
                <span className="text-gray-400">İstanbul, Türkiye</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>© 2024 El Yapımı. Tüm hakları saklıdır.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-pastel-pink-400 transition-colors">Gizlilik Politikası</a>
              <a href="#" className="hover:text-pastel-pink-400 transition-colors">Kullanım Şartları</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer