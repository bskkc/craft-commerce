const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Category = require('../models/Category');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get dashboard stats
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    // Get counts
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalCategories = await Category.countDocuments();

    // Get total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ['paid', 'processing', 'shipped', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'firstName lastName email');

    // Get top selling products (based on orders)
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { 
        _id: '$items.product', 
        totalSold: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }},
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }},
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } }
    ]);

    // Get monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRevenue = await Order.aggregate([
      { $match: { 
        createdAt: { $gte: sixMonthsAgo },
        status: { $in: ['paid', 'processing', 'shipped', 'delivered'] }
      }},
      { $group: {
        _id: { 
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get category distribution
    const categoryDistribution = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category'
      }},
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $project: {
        name: '$category.name',
        count: 1
      }}
    ]);

    res.json({
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalCategories,
        totalRevenue
      },
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentOrders: recentOrders.map(order => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        customer: order.user 
          ? `${order.user.firstName} ${order.user.lastName}`
          : order.customerInfo?.fullName || 'Misafir',
        email: order.user?.email || order.customerInfo?.email || '-',
        total: order.total,
        status: order.status,
        createdAt: order.createdAt
      })),
      topProducts: topProducts.map(item => ({
        _id: item._id,
        name: item.product?.name || 'Silinmiş Ürün',
        sales: item.totalSold,
        revenue: item.totalRevenue,
        image: item.product?.images?.[0]
      })),
      monthlyRevenue,
      categoryDistribution
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'İstatistikler yüklenemedi' });
  }
});

module.exports = router;
