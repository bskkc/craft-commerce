# El İşi E-Ticaret Sitesi 🎨

El yapımı ürünler (kavanoz, çerçeve, mum, dekorasyon vb.) için hazırlanmış kapsamlı bir e-ticaret platformu.

## ✨ Özellikler

- 🛍️ Modern ve şık tasarım (Pudra pembe & Bebek mavisi tema)
- 🔐 JWT tabanlı kullanıcı kimlik doğrulama
- 💳 iyzico ile güvenli ödeme
- 📦 Sipariş takip sistemi
- 🎯 Admin panel ile tam yönetim
- 📱 Responsive tasarım
- 🔍 Gelişmiş arama ve filtreleme

## 🛠️ Teknolojiler

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer (Dosya yükleme)
- iyzico Ödeme Entegrasyonu
- bcryptjs (Şifreleme)

### Frontend
- ⚡ Vite 5
- React 18
- Tailwind CSS 3
- React Router v6
- Axios
- Lucide React Icons

### Admin Panel
- ⚡ Vite 5
- React 18
- Tailwind CSS 3
- Recharts (Grafikler)
- React Router v6

## 📁 Proje Yapısı

```
craft-commerce/
├── backend/          # API sunucusu
├── frontend/         # Müşteri arayüzü
└── admin-panel/      # Yönetim paneli
```

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- MongoDB
- iyzico Hesabı (ödeme için)

### 1. Backend Kurulumu

```bash
cd backend
npm install
```

`.env` dosyası oluşturun:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/craft-commerce
JWT_SECRET=your-super-secret-jwt-key-change-this
ADMIN_SETUP_SECRET=replace-with-a-random-secret-at-least-32-characters
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=replace-with-a-unique-password-at-least-16-characters
IYZICO_API_KEY=your-iyzico-api-key
IYZICO_SECRET_KEY=your-iyzico-secret-key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
FRONTEND_URL=http://localhost:3000
```

Backend'i başlatın:
```bash
npm run dev
```

### 2. Frontend Kurulumu

```bash
cd frontend
npm install
```

`.env` dosyası oluşturun:
```env
VITE_API_URL=http://localhost:5000/api
```

Frontend'i başlatın:
```bash
npm run dev
```

### 3. Admin Panel Kurulumu

```bash
cd admin-panel
npm install
```

`.env` dosyası oluşturun:
```env
VITE_API_URL=http://localhost:5000/api
```

Admin paneli başlatın:
```bash
npm run dev
```

### 4. Demo Verileri (Opsiyonel)

Backend için demo verilerini yüklemek için:
```bash
cd backend
npm run seed
```

Seed komutu mevcut kullanıcı, kategori ve ürün verilerini silip yeniden oluşturur. Çalıştırmadan önce `.env` içindeki `SEED_ADMIN_EMAIL` ve en az 16 karakterli, benzersiz `SEED_ADMIN_PASSWORD` değerlerini ayarlayın.

Bu komut:
- 4 kategori oluşturur (Kavanozlar, Çerçeveler, Mumlar, Dekorasyon)
- 16 örnek ürün ekler
- Ortam değişkenlerinde belirttiğiniz e-posta ile admin kullanıcısı oluşturur

## 🔗 URL'ler

| Uygulama | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Admin Panel | http://localhost:3001 |
| Backend API | http://localhost:5000 |

## 📋 Özellikler

### Müşteri Tarafı
- ✅ Ürün listeleme ve arama
- ✅ Kategori bazlı filtreleme
- ✅ Ürün detay sayfası
- ✅ Sepet yönetimi
- ✅ Kullanıcı kaydı ve girişi
- ✅ iyzico ile güvenli ödeme
- ✅ Sipariş takibi
- ✅ Profil yönetimi

### Admin Paneli
- ✅ Dashboard (satış istatistikleri)
- ✅ Ürün yönetimi (CRUD)
- ✅ Kategori yönetimi
- ✅ Sipariş yönetimi
- ✅ Sipariş durumu güncelleme

## 🗄️ Veritabanı Modelleri

### User
- name, email, password
- role (user/admin)
- addresses[]

### Category
- name, slug, description
- image, isActive

### Product
- name, slug, description
- price, discountPrice
- category, images[]
- stock, isActive, isFeatured

### Order
- orderNumber, user
- items[], shippingAddress
- paymentMethod, paymentStatus
- status, totalAmount

## 💳 Ödeme Entegrasyonu

iyzico 3D Secure entegrasyonu kullanılmaktadır.

1. Sandbox ortamında test için: https://sandbox-merchant.iyzipay.com
2. Test kartları için iyzico dökümanlarına bakın

## 🔐 Admin Hesabı

Seed ile ilk admin hesabını oluşturmak için `.env` dosyasında `SEED_ADMIN_EMAIL` ve en az 16 karakterli benzersiz `SEED_ADMIN_PASSWORD` değerlerini ayarlayın. `/api/auth/create-admin` endpoint'i yalnızca en az 32 karakterli `ADMIN_SETUP_SECRET` ayarlandığında etkinleşir; bu değeri kimseyle paylaşmayın.

## 📝 API Endpoints

### Auth
- `POST /api/auth/register` - Kayıt
- `POST /api/auth/login` - Giriş
- `GET /api/auth/me` - Kullanıcı bilgisi

### Categories
- `GET /api/categories` - Tüm kategoriler
- `POST /api/categories` - Kategori oluştur (admin)
- `PUT /api/categories/:id` - Kategori güncelle (admin)
- `DELETE /api/categories/:id` - Kategori sil (admin)

### Products
- `GET /api/products` - Tüm ürünler
- `GET /api/products/:slug` - Ürün detayı
- `POST /api/products` - Ürün oluştur (admin)
- `PUT /api/products/:id` - Ürün güncelle (admin)
- `DELETE /api/products/:id` - Ürün sil (admin)

### Orders
- `GET /api/orders` - Siparişler
- `GET /api/orders/:id` - Sipariş detayı
- `POST /api/orders` - Sipariş oluştur
- `PUT /api/orders/:id/status` - Durum güncelle (admin)

### Payments
- `POST /api/payments/initialize` - Ödeme başlat
- `POST /api/payments/callback` - Ödeme callback

## 📄 Lisans

MIT