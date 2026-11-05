import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('Giriş başarılı');
      navigate('/');
    } else {
      setError(result.error);
      toast.error('Giriş başarısız');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-accent-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-2xl">E</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">El Yapımı Admin</h1>
            <p className="text-gray-500 mt-2">Yönetim paneline hoş geldiniz</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="Admin e-posta adresi"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-primary-500 rounded focus:ring-primary-400" />
                <span className="ml-2 text-sm text-gray-600">Beni hatırla</span>
              </label>
              <a href="#" className="text-sm text-primary-500 hover:text-primary-600">
                Şifremi unuttum
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Giriş yapılıyor...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Giriş Yap</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* Right Side - Decoration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-400 via-primary-500 to-accent-500 items-center justify-center p-12">
        <div className="text-center text-white">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
              <div className="absolute inset-4 bg-white/30 rounded-full"></div>
              <div className="absolute inset-8 bg-white/40 rounded-full flex items-center justify-center">
                <span className="text-4xl">🎨</span>
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">El Yapımı Ürünler</h2>
          <p className="text-white/80 max-w-sm mx-auto">
            Yönetim panelinizden ürünlerinizi, siparişlerinizi ve kategorilerinizi kolayca yönetin.
          </p>
          
          {/* Features */}
          <div className="mt-12 space-y-4">
            {[
              'Ürün ekleme ve düzenleme',
              'Sipariş takibi ve yönetimi',
              'Kategori yönetimi',
              'Satış istatistikleri'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 justify-center text-white/90">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;