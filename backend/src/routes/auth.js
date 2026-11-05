const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu email adresi zaten kayıtlı' });
    }

    const user = new User({ email, password, name, phone });
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Kayıt başarılı',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Kayıt işlemi başarısız' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Email veya şifre hatalı' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email veya şifre hatalı' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Giriş başarılı',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Giriş işlemi başarısız' });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: 'admin' });
    if (!user) {
      return res.status(401).json({ error: 'Admin hesabı bulunamadı' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email veya şifre hatalı' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Admin girişi başarılı',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Giriş işlemi başarısız' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      phone: req.user.phone,
      addresses: req.user.addresses,
      role: req.user.role
    }
  });
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    req.user.name = name || req.user.name;
    req.user.phone = phone || req.user.phone;
    
    await req.user.save();

    res.json({
      message: 'Profil güncellendi',
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        phone: req.user.phone,
        addresses: req.user.addresses
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Profil güncellenemedi' });
  }
});

// Add address
router.post('/addresses', auth, async (req, res) => {
  try {
    const { label, street, district, city, zipCode, lat, lng, isDefault } = req.body;

    if (!label || !street || !district || !city) {
      return res.status(400).json({ error: 'Gerekli alanlar eksik' });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      req.user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // If this is the first address, make it default
    const makeDefault = isDefault || req.user.addresses.length === 0;

    req.user.addresses.push({
      label,
      street,
      district,
      city,
      zipCode,
      lat,
      lng,
      isDefault: makeDefault
    });

    await req.user.save();

    res.status(201).json({
      message: 'Adres eklendi',
      addresses: req.user.addresses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Adres eklenemedi' });
  }
});

// Update address
router.put('/addresses/:addressId', auth, async (req, res) => {
  try {
    const { label, street, district, city, zipCode, lat, lng, isDefault } = req.body;
    const address = req.user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({ error: 'Adres bulunamadı' });
    }

    // If setting as default, unset others
    if (isDefault) {
      req.user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    address.label = label || address.label;
    address.street = street || address.street;
    address.district = district || address.district;
    address.city = city || address.city;
    address.zipCode = zipCode ?? address.zipCode;
    address.lat = lat ?? address.lat;
    address.lng = lng ?? address.lng;
    address.isDefault = isDefault ?? address.isDefault;

    await req.user.save();

    res.json({
      message: 'Adres güncellendi',
      addresses: req.user.addresses
    });
  } catch (error) {
    res.status(500).json({ error: 'Adres güncellenemedi' });
  }
});

// Delete address
router.delete('/addresses/:addressId', auth, async (req, res) => {
  try {
    const address = req.user.addresses.id(req.params.addressId);
    
    if (!address) {
      return res.status(404).json({ error: 'Adres bulunamadı' });
    }

    const wasDefault = address.isDefault;
    address.deleteOne();

    // If deleted address was default, make first remaining address default
    if (wasDefault && req.user.addresses.length > 0) {
      req.user.addresses[0].isDefault = true;
    }

    await req.user.save();

    res.json({
      message: 'Adres silindi',
      addresses: req.user.addresses
    });
  } catch (error) {
    res.status(500).json({ error: 'Adres silinemedi' });
  }
});

// Create admin user (only for initial setup - should be protected in production)
router.post('/create-admin', async (req, res) => {
  try {
    const { email, password, name, secretKey } = req.body;
    const adminSetupSecret = process.env.ADMIN_SETUP_SECRET;

    if (!adminSetupSecret || adminSetupSecret.length < 32) {
      return res.status(503).json({ error: 'Admin hesabı oluşturma devre dışı' });
    }

    if (secretKey !== adminSetupSecret) {
      return res.status(403).json({ error: 'Geçersiz güvenlik anahtarı' });
    }

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin hesabı zaten mevcut' });
    }

    const admin = new User({
      email,
      password,
      name,
      role: 'admin'
    });
    await admin.save();

    res.status(201).json({ message: 'Admin hesabı oluşturuldu' });
  } catch (error) {
    res.status(500).json({ error: 'Admin hesabı oluşturulamadı' });
  }
});

module.exports = router;
