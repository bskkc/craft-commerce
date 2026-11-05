const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, optionalAuth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all orders (admin only)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { 
      status, 
      paymentStatus,
      startDate,
      endDate,
      page = 1, 
      limit = 20 
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Siparişler yüklenemedi' });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Siparişler yüklenemedi' });
  }
});

// Cancel user's own order
router.put('/my-orders/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    // Sadece bekleyen veya ödendi durumundaki siparişler iptal edilebilir
    if (!['pending', 'paid'].includes(order.status)) {
      return res.status(400).json({ 
        error: 'Bu sipariş artık iptal edilemez. Sadece bekleyen veya ödendi durumundaki siparişler iptal edilebilir.' 
      });
    }

    // Stokları geri ekle
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Sipariş iptal edildi', order });
  } catch (error) {
    res.status(500).json({ error: 'Sipariş iptal edilemedi' });
  }
});

// Get order by order number (public with optional email verification)
router.get('/track/:orderNumber', optionalAuth, async (req, res) => {
  try {
    const { email } = req.query;
    
    // Build query
    let query = { orderNumber: req.params.orderNumber };
    
    // If user is logged in, check if order belongs to them
    if (req.user) {
      query.user = req.user._id;
    } else if (email) {
      // Guest user must provide email
      query['customerInfo.email'] = email;
    }
    // If no user and no email, still allow search by order number only
    
    const order = await Order.findOne(query);
    
    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    res.json({
      orderNumber: order.orderNumber,
      status: order.status,
      items: order.items,
      total: order.total,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Sipariş sorgulanamadı' });
  }
});

// Get order by ID (admin only)
router.get('/:id', auth, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name slug');
    
    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Sipariş yüklenemedi' });
  }
});

// Create order
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { 
      customerInfo, 
      shippingAddress, 
      items,
      notes,
      paymentMethod 
    } = req.body;

    // Validate input
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Sepet boş' });
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      return res.status(400).json({ error: 'Müşteri bilgileri eksik' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.district) {
      return res.status(400).json({ error: 'Adres bilgileri eksik' });
    }

    // Validate and calculate prices
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({ error: 'Ürün ID eksik' });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ error: `Ürün bulunamadı: ${item.productId}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Yetersiz stok: ${product.name}` });
      }

      const price = product.discountPrice || product.price;
      subtotal += price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price,
        quantity: item.quantity,
        image: product.images?.[0] || ''
      });

      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Calculate shipping (free over 500 TL)
    const shippingCost = subtotal >= 500 ? 0 : 29.90;
    
    // Kapıda ödeme hizmet bedeli
    const cashOnDeliveryFee = paymentMethod === 'cash_on_delivery' ? 10 : 0;
    const total = subtotal + shippingCost + cashOnDeliveryFee;

    const order = new Order({
      customerInfo,
      shippingAddress,
      items: orderItems,
      subtotal,
      shippingCost,
      total,
      notes,
      paymentMethod: paymentMethod || 'iyzico'
    });

    // If user is logged in, associate order with user
    if (req.user) {
      order.user = req.user._id;
    }

    await order.save();

    res.status(201).json({ 
      message: 'Sipariş oluşturuldu', 
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.total
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Sipariş oluşturulamadı', details: error.message });
  }
});

// Update order status (admin only)
router.put('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    order.status = status;
    await order.save();

    res.json({ message: 'Sipariş durumu güncellendi', order });
  } catch (error) {
    res.status(500).json({ error: 'Sipariş güncellenemedi' });
  }
});

// Cancel order (admin only)
router.put('/:id/cancel', auth, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ error: 'Teslim edilmiş sipariş iptal edilemez' });
    }

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Sipariş iptal edildi', order });
  } catch (error) {
    res.status(500).json({ error: 'Sipariş iptal edilemedi' });
  }
});

// Get order statistics (admin only)
router.get('/stats/summary', auth, adminOnly, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: 'delivered' });
    
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ error: 'İstatistikler yüklenemedi' });
  }
});

module.exports = router;
