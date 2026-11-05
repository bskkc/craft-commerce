const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's favorites
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json(user.favorites || []);
  } catch (error) {
    res.status(500).json({ error: 'Favoriler yüklenemedi' });
  }
});

// Add to favorites
router.post('/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    
    const user = await User.findById(req.user._id);
    
    // Check if already in favorites
    if (user.favorites.includes(productId)) {
      return res.status(400).json({ error: 'Ürün zaten favorilerde' });
    }
    
    user.favorites.push(productId);
    await user.save();
    
    // Return populated favorites
    await user.populate('favorites');
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ error: 'Favorilere eklenemedi' });
  }
});

// Remove from favorites
router.delete('/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const user = await User.findById(req.user._id);
    user.favorites = user.favorites.filter(id => id.toString() !== productId);
    await user.save();
    
    // Return populated favorites
    await user.populate('favorites');
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ error: 'Favorilerden kaldırılamadı' });
  }
});

// Toggle favorite
router.post('/:productId/toggle', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    
    const user = await User.findById(req.user._id);
    const index = user.favorites.findIndex(id => id.toString() === productId);
    
    let added = false;
    if (index === -1) {
      user.favorites.push(productId);
      added = true;
    } else {
      user.favorites.splice(index, 1);
    }
    
    await user.save();
    await user.populate('favorites');
    
    res.json({ 
      favorites: user.favorites,
      added,
      message: added ? 'Favorilere eklendi' : 'Favorilerden kaldırıldı'
    });
  } catch (error) {
    res.status(500).json({ error: 'İşlem başarısız' });
  }
});

module.exports = router;
