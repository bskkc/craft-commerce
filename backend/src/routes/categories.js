const express = require('express');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    const filter = active === 'true' ? { isActive: true } : {};
    
    const categories = await Category.find(filter).sort({ name: 1 });
    
    // Get product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ 
          category: category._id,
          isActive: true 
        });
        return {
          ...category.toObject(),
          productCount
        };
      })
    );
    
    res.json(categoriesWithCount);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Kategoriler yüklenemedi' });
  }
});

// Get category by slug (public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Kategori yüklenemedi' });
  }
});

// Get category by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Kategori yüklenemedi' });
  }
});

// Create category (admin only) - JSON or multipart/form-data
router.post('/', auth, adminOnly, async (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    upload.single('image')(req, res, (err) => {
      if (err) return next(err);
      handleCategoryCreate(req, res);
    });
  } else {
    handleCategoryCreate(req, res);
  }
});

async function handleCategoryCreate(req, res) {
  try {
    const { name, description, isActive, image } = req.body;
    
    const category = new Category({
      name,
      description,
      isActive: isActive !== 'false' && isActive !== false,
      image: req.file ? `/uploads/${req.file.filename}` : (image || null)
    });

    await category.save();
    
    // Get product count (will be 0 for new category)
    const categoryObj = category.toObject();
    categoryObj.productCount = 0;
    
    res.status(201).json(categoryObj);
  } catch (error) {
    console.error('Category create error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Bu kategori adı zaten mevcut' });
    }
    res.status(500).json({ error: 'Kategori oluşturulamadı' });
  }
}

// Update category (admin only) - JSON or multipart/form-data
router.put('/:id', auth, adminOnly, async (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    upload.single('image')(req, res, (err) => {
      if (err) return next(err);
      handleCategoryUpdate(req, res);
    });
  } else {
    handleCategoryUpdate(req, res);
  }
});

async function handleCategoryUpdate(req, res) {
  try {
    const { name, description, isActive, image } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }

    category.name = name || category.name;
    category.description = description !== undefined ? description : category.description;
    
    if (isActive !== undefined) {
      category.isActive = isActive !== 'false' && isActive !== false;
    }
    
    if (req.file) {
      category.image = `/uploads/${req.file.filename}`;
    } else if (image !== undefined) {
      category.image = image || null;
    }

    await category.save();
    
    // Get product count
    const Product = require('../models/Product');
    const productCount = await Product.countDocuments({ category: category._id, isActive: true });
    const categoryObj = category.toObject();
    categoryObj.productCount = productCount;
    
    res.json(categoryObj);
  } catch (error) {
    console.error('Category update error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Bu kategori adı zaten mevcut' });
    }
    res.status(500).json({ error: 'Kategori güncellenemedi' });
  }
}

// Delete category (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }
    res.json({ message: 'Kategori silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Kategori silinemedi' });
  }
});

module.exports = router;
