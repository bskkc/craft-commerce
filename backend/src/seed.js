const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

const seedData = async () => {
  try {
    const adminEmail = process.env.SEED_ADMIN_EMAIL;
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword || adminPassword.length < 16) {
      throw new Error('SEED_ADMIN_EMAIL and a SEED_ADMIN_PASSWORD of at least 16 characters are required');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB bağlantısı kuruldu');

    // Mevcut verileri temizle
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Mevcut veriler temizlendi');

    // Admin kullanıcı oluştur
    const admin = await User.create({
      name: 'Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin'
    });
    console.log(`Admin kullanıcı oluşturuldu: ${admin.email}`);

    // Kategoriler oluştur
    const categories = await Category.insertMany([
      {
        name: 'Kavanozlar',
        slug: 'kavanozlar',
        description: 'El yapımı dekoratif kavanozlar, mutfağınıza ve evinize şıklık katar.',
        isActive: true
      },
      {
        name: 'Çerçeveler',
        slug: 'cerceveler',
        description: 'Özel tasarım el yapımı çerçeveler, anılarınızı ölümsüzleştirir.',
        isActive: true
      },
      {
        name: 'Sepetler',
        slug: 'sepetler',
        description: 'El örgüsü sepetler, düzen ve dekorasyon için mükemmel.',
        isActive: true
      }
    ]);
    console.log('Kategoriler oluşturuldu');

    // Ürünler oluştur
    const products = [
      // Kavanozlar
      {
        name: 'Vintage Cam Kavanoz - Gül Motifli',
        slug: 'vintage-cam-kavanoz-gul-motifli',
        description: 'El boyama gül motifli dekoratif cam kavanoz. Mutfağınızda baharatlık veya şekerlik olarak kullanabilirsiniz. Her biri benzersiz tasarıma sahiptir.',
        price: 189,
        discountPrice: 149,
        category: categories[0]._id,
        images: ['https://images.unsplash.com/photo-1602720432905-f2f5c1a4c0c3?w=500', 'https://images.unsplash.com/photo-1544411047-c491e34a6ea2?w=500'],
        stock: 25,
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Bohem Tarzı Makrome Kavanoz',
        slug: 'bohem-tarzi-makrome-kavanoz',
        description: 'Makrome ip süslemeli bohem tarzı kavanoz. Çiçek vazonu olarak da kullanılabilir. Doğal pamuk ip ile örülmüştür.',
        price: 245,
        category: categories[0]._id,
        images: ['https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=500'],
        stock: 15,
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Mini Baharat Kavanozları Seti (6lı)',
        slug: 'mini-baharat-kavanozlari-seti',
        description: '6 adet mini cam kavanozdan oluşan set. Her biri farklı renkte el yazısı etiketli. Mutfak düzeniniz için ideal.',
        price: 320,
        discountPrice: 279,
        category: categories[0]._id,
        images: ['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500'],
        stock: 20,
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Ahşap Kapaklı Cam Kavanoz',
        slug: 'ahsap-kapakli-cam-kavanoz',
        description: 'Ceviz ağacından el yapımı kapaklı dekoratif kavanoz. Kahve, çay veya kurabiye saklamak için mükemmel.',
        price: 195,
        category: categories[0]._id,
        images: ['https://images.unsplash.com/photo-1530968033775-2c92736b131e?w=500'],
        stock: 18,
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Romantik Dantel Kavanoz',
        slug: 'romantik-dantel-kavanoz',
        description: 'El yapımı dantel süslemeli romantik kavanoz. Düğün, nişan hediyeleri için ideal. Mum veya çiçek konulabilir.',
        price: 165,
        discountPrice: 139,
        category: categories[0]._id,
        images: ['https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500'],
        stock: 30,
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Renkli Cam Kavanoz Seti (3lü)',
        slug: 'renkli-cam-kavanoz-seti',
        description: 'Pembe, mavi ve yeşil renklerde 3lü cam kavanoz seti. Mutfak raflarınız için şık bir düzenleme.',
        price: 275,
        category: categories[0]._id,
        images: ['https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=500'],
        stock: 12,
        isActive: true,
        isFeatured: false
      },

      // Çerçeveler
      {
        name: 'Pressed Flower Çerçeve - Lavanta',
        slug: 'pressed-flower-cerceve-lavanta',
        description: 'Gerçek kurutulmuş lavanta çiçekleri ile süslenmiş el yapımı çerçeve. 20x25cm boyutunda, duvar veya masa üstü kullanımına uygun.',
        price: 275,
        discountPrice: 225,
        category: categories[1]._id,
        images: ['https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=500'],
        stock: 12,
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Reçine Sanat Çerçeve - Okyanus',
        slug: 'recine-sanat-cerceve-okyanus',
        description: 'Okyanus dalgaları temalı epoksi reçine sanat eseri çerçeve. Her biri el yapımı ve benzersizdir. 30x40cm.',
        price: 450,
        category: categories[1]._id,
        images: ['https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=500'],
        stock: 8,
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Vintage Fotoğraf Çerçevesi',
        slug: 'vintage-fotograf-cercevesi',
        description: 'Antika görünümlü el yapımı ahşap çerçeve. Altın varak detayları ile süslenmiş. 15x20cm fotoğraf için uygun.',
        price: 165,
        category: categories[1]._id,
        images: ['https://images.unsplash.com/photo-1582053433976-25c00369fc93?w=500'],
        stock: 22,
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Makrome Duvar Çerçevesi',
        slug: 'makrome-duvar-cercevesi',
        description: 'Bohem tarzı makrome süslemeli duvar çerçevesi. Polaroid fotoğraflar için ideal. 3 adet fotoğraf alabilir.',
        price: 185,
        category: categories[1]._id,
        images: ['https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=500'],
        stock: 14,
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Ahşap Fotoğraf Çerçevesi - Rustik',
        slug: 'ahsap-fotograf-cercevesi-rustik',
        description: 'Geri dönüştürülmüş ahşaptan el yapımı rustik çerçeve. Doğal doku ve renk farklılıkları her parçayı benzersiz kılar.',
        price: 195,
        discountPrice: 165,
        category: categories[1]._id,
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'],
        stock: 18,
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Çoklu Fotoğraf Çerçevesi - Aile',
        slug: 'coklu-fotograf-cercevesi-aile',
        description: '5 farklı boyutta fotoğraf alabilen kolaj çerçeve. Aile fotoğrafları için mükemmel. 50x60cm.',
        price: 385,
        category: categories[1]._id,
        images: ['https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=500'],
        stock: 10,
        isActive: true,
        isFeatured: false
      },

      // Sepetler
      {
        name: 'Hasır Saklama Sepeti - Büyük',
        slug: 'hasir-saklama-sepeti-buyuk',
        description: 'El örgüsü doğal hasır sepet. Battaniye, yastık veya oyuncak saklamak için ideal. 40x35cm boyutunda.',
        price: 285,
        discountPrice: 245,
        category: categories[2]._id,
        images: ['https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=500'],
        stock: 15,
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Makrome Asılı Sepet',
        slug: 'makrome-asili-sepet',
        description: 'Makrome askılı dekoratif sepet. Bitki saksısı veya küçük eşyalar için. Bohem ev dekorasyonu için mükemmel.',
        price: 175,
        category: categories[2]._id,
        images: ['https://images.unsplash.com/photo-1545241047-6083a3684587?w=500'],
        stock: 20,
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Pamuklu Örme Sepet Seti (3lü)',
        slug: 'pamuklu-orme-sepet-seti',
        description: 'Yumuşak pamuk ipten el örgüsü 3lü sepet seti. Banyo, yatak odası veya bebek odası için ideal.',
        price: 320,
        category: categories[2]._id,
        images: ['https://images.unsplash.com/photo-1586105251261-72a756497a11?w=500'],
        stock: 12,
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Jüt Ekmek Sepeti',
        slug: 'jut-ekmek-sepeti',
        description: 'Doğal jüt ipten el yapımı ekmek sepeti. Kahvaltı sofralarınıza rustik şıklık katar.',
        price: 125,
        discountPrice: 99,
        category: categories[2]._id,
        images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500'],
        stock: 35,
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Piknik Sepeti - Vintage',
        slug: 'piknik-sepeti-vintage',
        description: 'El örgüsü vintage tarzı piknik sepeti. İç astarı ve kulpları ile. 45x30x25cm boyutunda.',
        price: 425,
        discountPrice: 375,
        category: categories[2]._id,
        images: ['https://images.unsplash.com/photo-1529042410759-befb1204b468?w=500'],
        stock: 8,
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Duvar Sepeti - Dekoratif Set',
        slug: 'duvar-sepeti-dekoratif-set',
        description: 'Duvar dekorasyonu için 3 farklı boyutta hasır sepet seti. Bohem duvar süslemesi için mükemmel.',
        price: 265,
        category: categories[2]._id,
        images: ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500'],
        stock: 14,
        isActive: true,
        isFeatured: false
      }
    ];

    await Product.insertMany(products);
    console.log('Ürünler oluşturuldu');

    console.log('\n✅ Seed işlemi tamamlandı!');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed hatası:', error);
    process.exit(1);
  }
};

seedData();