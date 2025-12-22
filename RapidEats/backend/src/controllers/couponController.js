const Coupon = require('../models/Coupon');
const { calculateDiscount } = require('../utils/helpers');

const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found or inactive' });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount is ${coupon.minOrderAmount}` 
      });
    }

    const discount = calculateDiscount(coupon, subtotal);

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description,
        freeProduct: coupon.freeProduct,
      },
      discount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error validating coupon' });
  }
};

module.exports = {
  validateCoupon,
};
