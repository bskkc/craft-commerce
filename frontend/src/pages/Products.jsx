import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiFilter, FiX, FiGrid, FiList } from 'react-icons/fi'
import ProductCard from '../components/ProductCard'
import Loading from '../components/Loading'
import api from '../services/api'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })

  const selectedCategory = searchParams.get('category') || ''
  const searchQuery = searchParams.get('search') || ''
  const sortBy = searchParams.get('sort') || ''

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [searchParams])

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories')
      setCategories(data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      if (searchQuery) params.append('search', searchQuery)
      if (sortBy) params.append('sort', sortBy)
      params.append('page', searchParams.get('page') || '1')
      
      const { data } = await api.get(`/products?${params}`)
      setProducts(data.products || [])
      setPagination({
        page: data.page || 1,
        totalPages: data.totalPages || 1
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (category) => {
    const params = new URLSearchParams(searchParams)
    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    params.delete('page')
    setSearchParams(params)
    setFilterOpen(false)
  }

  const handleSortChange = (sort) => {
    const params = new URLSearchParams(searchParams)
    if (sort) {
      params.set('sort', sort)
    } else {
      params.delete('sort')
    }
    setSearchParams(params)
  }

  return (
    <div className="pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-800 mb-4">
            {searchQuery ? `"${searchQuery}" için sonuçlar` : 'Tüm Ürünler'}
          </h1>
          <p className="text-gray-500 text-lg">
            El yapımı, özenle hazırlanmış ürünlerimizi keşfedin
          </p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 bg-white rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-pastel-pink-50 text-pastel-pink-600 rounded-xl font-medium hover:bg-pastel-pink-100 transition-colors"
            >
              <FiFilter className="w-5 h-5" />
              Filtreler
            </button>

            {/* Category Pills */}
            <div className="hidden md:flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => handleCategoryChange('')}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  !selectedCategory
                    ? 'bg-gradient-to-r from-pastel-pink-400 to-baby-blue-400 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tümü
              </button>
              {categories.map(cat => (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.slug
                      ? 'bg-gradient-to-r from-pastel-pink-400 to-baby-blue-400 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-pastel-pink-400"
            >
              <option value="">Sırala</option>
              <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
              <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
              <option value="newest">En Yeni</option>
              <option value="popular">En Popüler</option>
            </select>

            {/* View Mode */}
            <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : ''
                }`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : ''
                }`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Filter Panel */}
        {filterOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50">
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Filtreler</h3>
                <button onClick={() => setFilterOpen(false)}>
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                    !selectedCategory ? 'bg-pastel-pink-100 text-pastel-pink-600' : 'hover:bg-gray-100'
                  }`}
                >
                  Tüm Ürünler
                </button>
                {categories.map(cat => (
                  <button
                    key={cat._id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                      selectedCategory === cat.slug ? 'bg-pastel-pink-100 text-pastel-pink-600' : 'hover:bg-gray-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <Loading />
        ) : products.length > 0 ? (
          <>
            <div className={`grid gap-8 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams)
                      params.set('page', String(i + 1))
                      setSearchParams(params)
                    }}
                    className={`w-10 h-10 rounded-xl font-medium transition-all ${
                      pagination.page === i + 1
                        ? 'bg-gradient-to-r from-pastel-pink-400 to-baby-blue-400 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <span className="text-6xl mb-6 block">🔍</span>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Ürün Bulunamadı</h3>
            <p className="text-gray-500">Farklı filtreler deneyebilirsiniz.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products