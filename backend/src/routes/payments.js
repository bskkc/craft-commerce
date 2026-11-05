const express = require('express');
const Iyzipay = require('iyzipay');
const { v4: uuidv4 } = require('uuid');
const Order = require('../models/Order');

const router = express.Router();

// Lazy initialize iyzipay
let iyzipay = null;

const getIyzipay = () => {
  if (!iyzipay) {
    // Check if real credentials exist (not placeholder)
    const apiKey = process.env.IYZICO_API_KEY;
    const secretKey = process.env.IYZICO_SECRET_KEY;
    const baseUrl = process.env.IYZICO_BASE_URL;
    
    if (!apiKey || !secretKey || !baseUrl || 
        apiKey.includes('xxxx') || secretKey.includes('xxxx')) {
      return null; // Demo mode
    }
    
    iyzipay = new Iyzipay({
      apiKey,
      secretKey,
      uri: baseUrl
    });
  }
  return iyzipay;
};

// Initialize checkout form (3D Secure)
router.post('/initialize', async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    // Demo mode - iyzico credentials not configured
    const iyziInstance = getIyzipay();
    if (!iyziInstance) {
      // Update order as paid (demo)
      order.status = 'paid';
      order.paymentStatus = 'completed';
      order.paymentDetails = {
        paymentId: 'DEMO-' + Date.now(),
        conversationId: 'DEMO'
      };
      await order.save();
      
      return res.json({
        status: 'demo',
        message: 'Demo modu - Ödeme simüle edildi',
        orderNumber: order.orderNumber
      });
    }

    const conversationId = uuidv4();

    // Prepare basket items
    const basketItems = order.items.map((item, index) => ({
      id: item.product.toString(),
      name: item.name,
      category1: 'El İşi Ürünler',
      itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
      price: (item.price * item.quantity).toFixed(2)
    }));

    // Add shipping as basket item if applicable
    if (order.shippingCost > 0) {
      basketItems.push({
        id: 'SHIPPING',
        name: 'Kargo Ücreti',
        category1: 'Kargo',
        itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
        price: order.shippingCost.toFixed(2)
      });
    }

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId,
      price: order.total.toFixed(2),
      paidPrice: order.total.toFixed(2),
      currency: Iyzipay.CURRENCY.TRY,
      basketId: order._id.toString(),
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: `${process.env.FRONTEND_URL}/odeme/callback`,
      enabledInstallments: [1, 2, 3, 6],
      buyer: {
        id: order.user?.toString() || 'GUEST',
        name: order.customerInfo.name.split(' ')[0],
        surname: order.customerInfo.name.split(' ').slice(1).join(' ') || order.customerInfo.name.split(' ')[0],
        gsmNumber: order.customerInfo.phone,
        email: order.customerInfo.email,
        identityNumber: '11111111111', // TC kimlik numarası (test için)
        registrationAddress: `${order.shippingAddress.street}, ${order.shippingAddress.district}`,
        ip: req.ip || '127.0.0.1',
        city: order.shippingAddress.city,
        country: 'Turkey',
        zipCode: order.shippingAddress.zipCode || '34000'
      },
      shippingAddress: {
        contactName: order.customerInfo.name,
        city: order.shippingAddress.city,
        country: 'Turkey',
        address: `${order.shippingAddress.street}, ${order.shippingAddress.district}`,
        zipCode: order.shippingAddress.zipCode || '34000'
      },
      billingAddress: {
        contactName: order.customerInfo.name,
        city: order.shippingAddress.city,
        country: 'Turkey',
        address: `${order.shippingAddress.street}, ${order.shippingAddress.district}`,
        zipCode: order.shippingAddress.zipCode || '34000'
      },
      basketItems
    };

    getIyzipay().checkoutFormInitialize.create(request, async (err, result) => {
      if (err) {
        console.error('iyzico error:', err);
        return res.status(500).json({ error: 'Ödeme başlatılamadı' });
      }

      if (result.status !== 'success') {
        console.error('iyzico result:', result);
        return res.status(400).json({ error: result.errorMessage || 'Ödeme başlatılamadı' });
      }

      // Save conversation ID for later verification
      order.paymentDetails = {
        conversationId,
        token: result.token
      };
      await order.save();

      res.json({
        status: 'success',
        checkoutFormContent: result.checkoutFormContent,
        token: result.token
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ödeme başlatılamadı' });
  }
});

// Verify payment after callback
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    getIyzipay().checkoutForm.retrieve({
      locale: Iyzipay.LOCALE.TR,
      token
    }, async (err, result) => {
      if (err) {
        console.error('iyzico verify error:', err);
        return res.status(500).json({ error: 'Ödeme doğrulanamadı' });
      }

      const order = await Order.findOne({ 'paymentDetails.token': token });
      if (!order) {
        return res.status(404).json({ error: 'Sipariş bulunamadı' });
      }

      if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
        // Payment successful
        order.paymentStatus = 'completed';
        order.status = 'paid';
        order.paymentDetails = {
          ...order.paymentDetails,
          paymentId: result.paymentId,
          cardAssociation: result.cardAssociation,
          cardFamily: result.cardFamily,
          lastFourDigits: result.lastFourDigits
        };
        await order.save();

        res.json({
          status: 'success',
          message: 'Ödeme başarılı',
          orderNumber: order.orderNumber
        });
      } else {
        // Payment failed
        order.paymentStatus = 'failed';
        await order.save();

        res.status(400).json({
          status: 'failure',
          message: result.errorMessage || 'Ödeme başarısız'
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ödeme doğrulanamadı' });
  }
});

// Get payment details (admin only)
router.get('/order/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    res.json({
      paymentStatus: order.paymentStatus,
      paymentDetails: {
        paymentId: order.paymentDetails?.paymentId,
        cardAssociation: order.paymentDetails?.cardAssociation,
        cardFamily: order.paymentDetails?.cardFamily,
        lastFourDigits: order.paymentDetails?.lastFourDigits
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Ödeme bilgileri alınamadı' });
  }
});

module.exports = router;
