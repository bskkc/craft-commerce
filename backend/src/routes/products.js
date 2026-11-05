const express = require('express');
const Product = require('../models/Product');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      featured, 
      active, 
      search, 
      minPrice, 
      maxPrice,
      sort = '-createdAt',
      page = 1,
      limit = 12 
    } = req.query;

    const filter = {};
    
    // Category filter - support both ObjectId and slug
    if (category) {
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.category = category;
      } else {
        // Find category by slug
        const Category = require('../models/Category');
        const cat = await Category.findOne({ slug: category });
        if (cat) filter.category = cat._id;
      }
    }
    if (featured === 'true') filter.isFeatured = true;
    if (active !== 'false') filter.isActive = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    // Sort mapping
    let sortOption = '-createdAt'; // default
    switch(sort) {
      case 'price_asc':
        sortOption = 'price';
        break;
      case 'price_desc':
        sortOption = '-price';
        break;
      case 'newest':
        sortOption = '-createdAt';
        break;
      case 'popular':
        sortOption = '-isFeatured -createdAt';
        break;
      default:
        if (sort) sortOption = sort;
    }
    
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      products,
      page: Number(page),
      totalPages,
      total,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Ürünler yüklenemedi' });
  }
});

// Get featured products (public)
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .populate('category', 'name slug')
      .limit(8);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Öne çıkan ürünler yüklenemedi' });
  }
});

// Get product by slug (public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Ürün yüklenemedi' });
  }
});

// Get product by ID or slug (public)
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const mongoose = require('mongoose');
    
    let product;
    // Check if it's a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      product = await Product.findById(idOrSlug)
        .populate('category', 'name slug');
    }
    
    // If not found by ID, try slug
    if (!product) {
      product = await Product.findOne({ slug: idOrSlug })
        .populate('category', 'name slug');
    }
    
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Ürün yüklenemedi' });
  }
});

// Upload product images (admin only)
router.post('/upload', auth, adminOnly, upload.array('images', 5), async (req, res) => {
  try {
    console.log('Upload request received, files:', req.files?.length || 0);
    
    if (!req.files || req.files.length === 0) {
      console.log('No files received');
      return res.status(400).json({ error: 'Görsel yüklenmedi' });
    }
    
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    console.log('Uploaded images:', imageUrls);
    
    res.json({ 
      message: 'Görseller yüklendi',
      images: imageUrls 
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Görsel yüklenemedi' });
  }
});

// Create product (admin only) - JSON or multipart/form-data
router.post('/', auth, adminOnly, async (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    upload.array('images', 5)(req, res, (err) => {
      if (err) return next(err);
      handleProductCreate(req, res, true);
    });
  } else {
    handleProductCreate(req, res, false);
  }
});

async function handleProductCreate(req, res, isMultipart) {
  try {
    const { 
      name, 
      description, 
      price, 
      discountPrice,
      category, 
      stock, 
      materials,
      dimensions,
      isActive,
      isFeatured,
      images: bodyImages
    } = req.body;

    // Handle images
    let images = [];
    if (isMultipart && req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/${file.filename}`);
    } else if (bodyImages) {
      // JSON request with pre-uploaded image URLs
      if (Array.isArray(bodyImages)) {
        images = bodyImages.filter(img => 
          typeof img === 'string' && 
          (img.startsWith('/') || img.startsWith('http'))
        );
      }
    }

    const product = new Product({
      name,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      category,
      stock: Number(stock) || 0,
      materials,
      dimensions: dimensions ? (typeof dimensions === 'string' ? JSON.parse(dimensions) : dimensions) : undefined,
      images,
      isActive: isActive !== 'false' && isActive !== false,
      isFeatured: isFeatured === 'true' || isFeatured === true
    });

    await product.save();
    await product.populate('category', 'name slug');
    
    res.status(201).json({ message: 'Ürün oluşturuldu', product });
  } catch (error) {
    console.error('Product create error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Bu ürün adı zaten mevcut' });
    }
    res.status(500).json({ error: 'Ürün oluşturulamadı' });
  }
}

// Update product (admin only) - JSON or multipart/form-data
router.put('/:id', auth, adminOnly, async (req, res, next) => {
  // Check if this is multipart/form-data
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    // Use multer for file upload
    upload.array('images', 5)(req, res, (err) => {
      if (err) return next(err);
      handleProductUpdate(req, res, true);
    });
  } else {
    // JSON request
    handleProductUpdate(req, res, false);
  }
});

async function handleProductUpdate(req, res, isMultipart) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    const { 
      name, 
      description, 
      price, 
      discountPrice,
      category, 
      stock, 
      materials,
      dimensions,
      isActive,
      isFeatured,
      existingImages,
      images: bodyImages
    } = req.body;

    // Handle images
    let images = product.images;
    
    if (isMultipart) {
      // Multipart form data
      if (existingImages) {
        try {
          images = JSON.parse(existingImages);
        } catch (e) {
          images = [];
        }
      }
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => `/uploads/${file.filename}`);
        images = [...images, ...newImages];
      }
    } else {
      // JSON request - filter out base64 images (keep only URLs)
      if (bodyImages && Array.isArray(bodyImages)) {
        images = bodyImages.filter(img => 
          typeof img === 'string' && 
          (img.startsWith('/') || img.startsWith('http'))
        );
        // If no valid URLs, keep existing images
        if (images.length === 0 && product.images.length > 0) {
          images = product.images;
        }
      }
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? Number(price) : product.price;
    product.discountPrice = discountPrice ? Number(discountPrice) : product.discountPrice;
    product.category = category || product.category;
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    product.materials = materials !== undefined ? materials : product.materials;
    
    // Handle dimensions
    if (dimensions) {
      if (typeof dimensions === 'string') {
        try {
          product.dimensions = JSON.parse(dimensions);
        } catch (e) {
          // Invalid JSON, keep existing
        }
      } else if (typeof dimensions === 'object') {
        product.dimensions = dimensions;
      }
    }
    
    product.images = images;
    
    // Handle boolean fields
    if (isActive !== undefined) {
      product.isActive = typeof isActive === 'boolean' ? isActive : isActive !== 'false';
    }
    if (isFeatured !== undefined) {
      product.isFeatured = typeof isFeatured === 'boolean' ? isFeatured : isFeatured === 'true';
    }

    await product.save();
    await product.populate('category', 'name slug');

    res.json({ message: 'Ürün güncellendi', product });
  } catch (error) {
    console.error('Product update error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Bu ürün adı zaten mevcut' });
    }
    res.status(500).json({ error: 'Ürün güncellenemedi' });
  }
}

// Delete product (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    res.json({ message: 'Ürün silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Ürün silinemedi' });
  }
});

module.exports = router;
