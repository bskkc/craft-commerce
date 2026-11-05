import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import PaymentCallback from './pages/PaymentCallback'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import OrderTracking from './pages/OrderTracking'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/urunler" element={<Products />} />
          <Route path="/urunler/:slug" element={<ProductDetail />} />
          <Route path="/urun/:id" element={<ProductDetail />} />
          <Route path="/sepet" element={<Cart />} />
          <Route path="/odeme" element={<Checkout />} />
          <Route path="/odeme/sonuc" element={<PaymentCallback />} />
          <Route path="/giris" element={<Login />} />
          <Route path="/kayit" element={<Register />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/siparis-takip" element={<OrderTracking />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App