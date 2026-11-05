import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data.user)
    } catch (error) {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData)
    setUser(data.user)
    return data
  }

  const addAddress = async (addressData) => {
    const { data } = await api.post('/auth/addresses', addressData)
    setUser(prev => ({ ...prev, addresses: data.addresses }))
    return data
  }

  const updateAddress = async (addressId, addressData) => {
    const { data } = await api.put(`/auth/addresses/${addressId}`, addressData)
    setUser(prev => ({ ...prev, addresses: data.addresses }))
    return data
  }

  const deleteAddress = async (addressId) => {
    const { data } = await api.delete(`/auth/addresses/${addressId}`)
    setUser(prev => ({ ...prev, addresses: data.addresses }))
    return data
  }

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data
  }

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      fetchUser, 
      updateProfile, 
      setUser,
      addAddress,
      updateAddress,
      deleteAddress
    }}>
      {children}
    </AuthContext.Provider>
  )
}