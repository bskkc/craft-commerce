import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', image: '' });
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, category: null });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (error) {
      console.error('Fetch error:', error);
      // Demo data
      setCategories([
        { _id: '1', name: 'Kavanozlar', description: 'El yapımı dekoratif kavanozlar', productCount: 8 },
        { _id: '2', name: 'Çerçeveler', description: 'Ahşap ve vintage çerçeveler', productCount: 5 },
        { _id: '3', name: 'Mumlar', description: 'Doğal ve kokulu mumlar', productCount: 6 },
        { _id: '4', name: 'Dekorasyon', description: 'Ev dekorasyon ürünleri', productCount: 4 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        image: category.image || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', image: '' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', image: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      if (editingCategory) {
        const res = await updateCategory(editingCategory._id, formData);
        const updatedCategory = res.data.category || res.data;
        setCategories(categories.map(cat =>
          cat._id === editingCategory._id ? updatedCategory : cat
        ));
        toast.success('Kategori güncellendi');
      } else {
        const res = await createCategory(formData);
        const newCategory = res.data.category || res.data;
        setCategories([...categories, newCategory]);
        toast.success('Kategori oluşturuldu');
      }
      closeModal();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.error || 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.category) return;
    try {
      await deleteCategory(deleteModal.category._id);
      setCategories(categories.filter(cat => cat._id !== deleteModal.category._id));
      setDeleteModal({ open: false, category: null });
      toast.success('Kategori silindi');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Kategori silinemedi');
    }
  };

  const categoryColors = [
    'from-primary-400 to-primary-500',
    'from-accent-400 to-accent-500',
    'from-green-400 to-green-500',
    'from-purple-400 to-purple-500',
    'from-orange-400 to-orange-500',
    'from-pink-400 to-pink-500',
  ];

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kategoriler</h1>
          <p className="text-gray-500">Toplam {categories.length} kategori</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-2 w-fit"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Kategori Ekle
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <div key={category._id} className="card overflow-hidden group">
            {/* Header */}
            <div className={`h-32 bg-gradient-to-br ${categoryColors[index % categoryColors.length]} p-6 flex items-end`}>
              <div>
                <span className="text-white/80 text-sm">{category.productCount || 0} ürün</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">{category.name}</h3>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                    {category.description || 'Açıklama eklenmemiş'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openModal(category)}
                  className="flex-1 py-2 text-center text-accent-500 bg-accent-50 rounded-lg hover:bg-accent-100 transition-colors text-sm font-medium"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => setDeleteModal({ open: true, category })}
                  className="flex-1 py-2 text-center text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Card */}
        <button
          onClick={() => openModal()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center min-h-[240px] hover:border-primary-400 hover:bg-primary-50/50 transition-colors group"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-primary-100 transition-colors">
            <svg className="w-8 h-8 text-gray-400 group-hover:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="mt-4 text-gray-500 font-medium group-hover:text-primary-500">Yeni Kategori Ekle</span>
        </button>
      </div>

      {/* Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Örn: Kavanozlar"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Kategori hakkında kısa bir açıklama..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 btn-outline"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 btn-primary"
                >
                  {saving ? 'Kaydediliyor...' : editingCategory ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Kategoriyi Sil</h3>
              <p className="text-gray-500 mb-6">
                <strong>{deleteModal.category?.name}</strong> kategorisini silmek istediğinize emin misiniz?
                Bu kategorideki ürünler de etkilenebilir.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteModal({ open: false, category: null })}
                  className="btn-outline"
                >
                  İptal
                </button>
                <button
                  onClick={handleDelete}
                  className="btn-danger"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;