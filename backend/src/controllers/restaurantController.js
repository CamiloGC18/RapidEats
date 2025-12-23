const Restaurant = require('../models/Restaurant');
const Product = require('../models/Product');

const getAllRestaurants = async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const restaurants = await Restaurant.find(filter)
      .select('-__v')
      .sort({ isFeatured: -1, rating: -1, totalOrders: -1 });

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching restaurants' });
  }
};

const getRestaurantBySlug = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ 
      slug: req.params.slug,
      isActive: true 
    }).select('-__v');

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const products = await Product.find({
      restaurantId: restaurant._id,
      isActive: true,
    }).sort({ category: 1, order: 1 });

    res.json({ restaurant, products });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching restaurant' });
  }
};

const getFeaturedRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      isActive: true,
      isFeatured: true,
    })
      .select('-__v')
      .limit(10)
      .sort({ rating: -1 });

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured restaurants' });
  }
};

const getRestaurantsByCategory = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      category: req.params.category,
      isActive: true,
    })
      .select('-__v')
      .sort({ rating: -1, totalOrders: -1 });

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching restaurants by category' });
  }
};

module.exports = {
  getAllRestaurants,
  getRestaurantBySlug,
  getFeaturedRestaurants,
  getRestaurantsByCategory,
};
