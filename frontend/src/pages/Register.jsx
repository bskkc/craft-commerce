import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır')
      return
    }

    setLoading(true)

    try {
      await register(formData.name, formData.email, formData.password)
      toast.success('Kayıt başarılı! Hoş geldiniz 🎉')
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Kayıt yapılamadı')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-pink-50 via-white to-baby-blue-50 pt-20 pb-12 px-4">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-pastel-pink-200 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-baby-blue-200 rounded-full blur-3xl opacity-30"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pastel-pink-400 to-baby-blue-400 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎀</span>
              </div>
              <span className="text-2xl font-display font-bold gradient-text">El Yapımı</span>
            </Link>
            <h1 className="text-2xl font-display font-bold text-gray-800">Kayıt Ol</h1>
            <p className="text-gray-500 mt-2">Yeni hesap oluşturun</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="input-field pl-12"
                  placeholder="Adınız Soyadınız"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="input-field pl-12"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Şifre</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="input-field pl-12 pr-12"
                  placeholder="En az 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Şifre Tekrar</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="input-field pl-12"
                  placeholder="Şifrenizi tekrar girin"
                />
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" required className="w-4 h-4 mt-1 rounded text-pastel-pink-500" />
              <span className="text-sm text-gray-600">
                <Link to="#" className="text-pastel-pink-500">Kullanım şartlarını</Link> ve{' '}
                <Link to="#" className="text-pastel-pink-500">gizlilik politikasını</Link> kabul ediyorum.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500">
              Zaten hesabınız var mı?{' '}
              <Link to="/giris" className="text-pastel-pink-500 font-medium hover:text-pastel-pink-600">
                Giriş Yapın
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register