import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import api from '../services/api'

const WishlistContext = createContext()

export const useWishlist = () => useContext(WishlistContext)

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(false)

  // Kullanıcı değiştiğinde favorileri yükle
  useEffect(() => {
    if (user) {
      fetchFavorites()
    } else {
      // Kullanıcı çıkış yaptığında localStorage'dan yükle
      const savedWishlist = localStorage.getItem('wishlist')
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist))
      } else {
        setWishlistItems([])
      }
    }
  }, [user])

  // Giriş yapmamış kullanıcılar için localStorage'a kaydet
  useEffect(() => {
    if (!user) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems))
    }
  }, [wishlistItems, user])

  const fetchFavorites = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/favorites')
      setWishlistItems(data)
    } catch (error) {
      console.error('Favoriler yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToWishlist = async (product) => {
    if (user) {
      // API'ye ekle
      try {
        const { data } = await api.post(`/favorites/${product._id}`)
        setWishlistItems(data)
      } catch (error) {
        console.error('Favorilere eklenemedi:', error)
      }
    } else {
      // localStorage'a ekle
      setWishlistItems(prev => {
        const exists = prev.find(item => item._id === product._id)
        if (exists) return prev
        return [...prev, product]
      })
    }
  }

  const removeFromWishlist = async (productId) => {
    if (user) {
      // API'den kaldır
      try {
        const { data } = await api.delete(`/favorites/${productId}`)
        setWishlistItems(data)
      } catch (error) {
        console.error('Favorilerden kaldırılamadı:', error)
      }
    } else {
      // localStorage'dan kaldır
      setWishlistItems(prev => prev.filter(item => item._id !== productId))
    }
  }

  const toggleWishlist = async (product) => {
    const exists = wishlistItems.find(item => item._id === product._id)
    
    if (user) {
      // API kullan
      try {
        const { data } = await api.post(`/favorites/${product._id}/toggle`)
        setWishlistItems(data.favorites)
        return data.added
      } catch (error) {
        console.error('İşlem başarısız:', error)
        return exists ? true : false
      }
    } else {
      // localStorage kullan
      if (exists) {
        setWishlistItems(prev => prev.filter(item => item._id !== product._id))
        return false
      } else {
        setWishlistItems(prev => [...prev, product])
        return true
      }
    }
  }

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item._id === productId)
  }

  const clearWishlist = async () => {
    if (user) {
      // Tüm favorileri tek tek sil
      for (const item of wishlistItems) {
        await api.delete(`/favorites/${item._id}`)
      }
    }
    setWishlistItems([])
    if (!user) {
      localStorage.removeItem('wishlist')
    }
  }

  // Kullanıcı giriş yaptığında localStorage'daki favorileri API'ye aktar
  const syncLocalFavoritesToAPI = async () => {
    const localWishlist = localStorage.getItem('wishlist')
    if (localWishlist && user) {
      const items = JSON.parse(localWishlist)
      for (const item of items) {
        try {
          await api.post(`/favorites/${item._id}`)
        } catch (error) {
          // Zaten varsa veya hata olursa devam et
        }
      }
      localStorage.removeItem('wishlist')
      fetchFavorites()
    }
  }

  // Kullanıcı giriş yaptığında synchronize et
  useEffect(() => {
    if (user) {
      syncLocalFavoritesToAPI()
    }
  }, [user])

  const wishlistCount = wishlistItems.length

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
      clearWishlist,
      wishlistCount,
      loading
    }}>
      {children}
    </WishlistContext.Provider>
  )
}
