import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProduct, createProduct, updateProduct, getCategories, uploadProductImage } from '../services/api';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    images: [],
    isActive: true,
    isFeatured: false,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const categoriesRes = await getCategories();
      setCategories(categoriesRes.data);

      if (isEditing) {
        const productRes = await getProduct(id);
        const product = productRes.data;
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || '',
          stock: product.stock || '',
          category: product.category?._id || '',
          images: product.images || [],
          isActive: product.isActive ?? true,
          isFeatured: product.isFeatured ?? false,
        });
        setImagePreview(product.images || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      // Demo categories
      setCategories([
        { _id: '1', name: 'Kavanozlar' },
        { _id: '2', name: 'Çerçeveler' },
        { _id: '3', name: 'Mumlar' },
        { _id: '4', name: 'Dekorasyon' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    console.log('Files selected:', files.length);
    if (files.length === 0) return;

    // Show loading previews
    const tempPreviews = files.map(() => 'loading');
    setImagePreview(prev => [...prev, ...tempPreviews]);

    try {
      // Create FormData and upload to server
      const uploadFormData = new FormData();
      files.forEach(file => {
        uploadFormData.append('images', file);
      });

      console.log('Uploading images...');
      const response = await uploadProductImage(uploadFormData);
      console.log('Upload response:', response.data);
      const uploadedUrls = response.data.images;

      // Replace loading previews with actual URLs
      setImagePreview(prev => {
        const filtered = prev.filter(p => p !== 'loading');
        const newPreviews = [...filtered, ...uploadedUrls];
        console.log('New imagePreview:', newPreviews);
        return newPreviews;
      });
    } catch (error) {
      console.error('Upload error:', error.response?.data || error.message);
      // Remove loading previews on error
      setImagePreview(prev => prev.filter(p => p !== 'loading'));
      setErrors({ submit: 'Görsel yüklenemedi. Lütfen tekrar deneyin.' });
    }
  };

  const removeImage = (index) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Ürün adı gerekli';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Geçerli bir fiyat girin';
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Geçerli bir stok miktarı girin';
    if (!formData.category) newErrors.category = 'Kategori seçin';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      // Filter out 'loading' placeholders and only include valid URLs
      const validImages = imagePreview.filter(img => 
        img !== 'loading' && 
        typeof img === 'string' && 
        (img.startsWith('/') || img.startsWith('http'))
      );
      
      console.log('Submitting with images:', validImages);
      
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images: validImages,
      };

      if (isEditing) {
        await updateProduct(id, productData);
        toast.success('Ürün güncellendi');
      } else {
        await createProduct(productData);
        toast.success('Ürün oluşturuldu');
      }
      navigate('/products');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
      setErrors({ submit: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/products')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
          </h1>
          <p className="text-gray-500">
            {isEditing ? 'Ürün bilgilerini güncelleyin' : 'Yeni bir ürün oluşturun'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {errors.submit}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">Temel Bilgiler</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ürün Adı *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input-field ${errors.name ? 'border-red-500 focus:ring-red-400' : ''}`}
                  placeholder="Örn: Vintage Ahşap Çerçeve"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="input-field resize-none"
                  placeholder="Ürün hakkında detaylı bilgi..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat (₺) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`input-field ${errors.price ? 'border-red-500 focus:ring-red-400' : ''}`}
                    placeholder="0.00"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stok Miktarı *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    className={`input-field ${errors.stock ? 'border-red-500 focus:ring-red-400' : ''}`}
                    placeholder="0"
                  />
                  {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="card p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Ürün Görselleri</h2>

              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="images" className="cursor-pointer">
                  <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">Görsel yüklemek için tıklayın</p>
                  <p className="text-gray-400 text-sm mt-1">PNG, JPG, WEBP - Max 5MB</p>
                </label>
              </div>

              {imagePreview.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {imagePreview.map((img, index) => (
                    <div key={index} className="relative group">
                      {img === 'loading' ? (
                        <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <img
                          src={img.startsWith('/') ? `http://localhost:5000${img}` : img}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      )}
                      {img !== 'loading' && (
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category */}
            <div className="card p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Kategori</h2>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`input-field ${errors.category ? 'border-red-500 focus:ring-red-400' : ''}`}
              >
                <option value="">Kategori Seçin</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
            </div>

            {/* Status */}
            <div className="card p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Durum</h2>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">Aktif</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-400 peer-focus:ring-2 peer-focus:ring-primary-300 transition-colors"></div>
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full peer-checked:translate-x-5 transition-transform shadow"></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">Öne Çıkan</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-accent-400 peer-focus:ring-2 peer-focus:ring-accent-300 transition-colors"></div>
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full peer-checked:translate-x-5 transition-transform shadow"></div>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="card p-6 space-y-3">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{isEditing ? 'Güncelle' : 'Oluştur'}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="btn-outline w-full"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;