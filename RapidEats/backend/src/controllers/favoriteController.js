const Favorite = require('../models/Favorite');
const Restaurant = require('../models/Restaurant');
const { AppError } = require('../middlewares/errorHandler');

// @desc    Add restaurant to favorites
// @route   POST /api/favorites
// @access  Private
exports.addFavorite = async (req, res, next) => {
  try {
    const { restaurantId, notes } = req.body;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return next(new AppError('Restaurant not found', 404));
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      restaurant: restaurantId,
    });

    if (existingFavorite) {
      return next(new AppError('Restaurant already in favorites', 400));
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      restaurant: restaurantId,
      notes,
    });

    // Update restaurant favorite count
    await Restaurant.findByIdAndUpdate(restaurantId, {
      $inc: { favoriteCount: 1 },
    });

    await favorite.populate('restaurant', 'name slug logo category rating ratings estimatedDeliveryTime');

    res.status(201).json({
      success: true,
      data: favorite,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove restaurant from favorites
// @route   DELETE /api/favorites/:restaurantId
// @access  Private
exports.removeFavorite = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      user: req.user._id,
      restaurant: restaurantId,
    });

    if (!favorite) {
      return next(new AppError('Favorite not found', 404));
    }

    // Update restaurant favorite count
    await Restaurant.findByIdAndUpdate(restaurantId, {
      $inc: { favoriteCount: -1 },
    });

    res.json({
      success: true,
      message: 'Removed from favorites',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sortBy = '-addedAt' } = req.query;

    const favorites = await Favorite.find({ user: req.user._id })
      .populate('restaurant', 'name slug logo category rating ratings estimatedDeliveryTime isActive isFeatured')
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Favorite.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: favorites,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if restaurant is favorited
// @route   GET /api/favorites/check/:restaurantId
// @access  Private
exports.checkFavorite = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    const favorite = await Favorite.findOne({
      user: req.user._id,
      restaurant: restaurantId,
    });

    res.json({
      success: true,
      data: {
        isFavorite: !!favorite,
        favorite: favorite || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update favorite notes
// @route   PATCH /api/favorites/:restaurantId
// @access  Private
exports.updateFavorite = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { notes } = req.body;

    const favorite = await Favorite.findOneAndUpdate(
      {
        user: req.user._id,
        restaurant: restaurantId,
      },
      { notes },
      { new: true, runValidators: true }
    ).populate('restaurant', 'name slug logo category rating ratings estimatedDeliveryTime');

    if (!favorite) {
      return next(new AppError('Favorite not found', 404));
    }

    res.json({
      success: true,
      data: favorite,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get favorite statistics
// @route   GET /api/favorites/stats
// @access  Private
exports.getFavoriteStats = async (req, res, next) => {
  try {
    const stats = await Favorite.aggregate([
      { $match: { user: req.user._id } },
      {
        $lookup: {
          from: 'restaurants',
          localField: 'restaurant',
          foreignField: '_id',
          as: 'restaurantData',
        },
      },
      { $unwind: '$restaurantData' },
      {
        $group: {
          _id: '$restaurantData.category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const total = await Favorite.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: {
        total,
        byCategory: stats,
      },
    });
  } catch (error) {
    next(error);
  }
};
