const {
  savePushToken,
  removePushToken,
  updateNotificationPreferences,
  sendPushNotification,
} = require('../services/notificationService');
const { AppError } = require('../middlewares/errorHandler');

// @desc    Register push token
// @route   POST /api/notifications/token
// @access  Private
exports.registerToken = async (req, res, next) => {
  try {
    const { token, device, platform } = req.body;

    if (!token) {
      return next(new AppError('Token is required', 400));
    }

    const result = await savePushToken(req.user._id, token, device, platform);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unregister push token
// @route   DELETE /api/notifications/token
// @access  Private
exports.unregisterToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return next(new AppError('Token is required', 400));
    }

    const result = await removePushToken(req.user._id, token);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notification preferences
// @route   PATCH /api/notifications/preferences
// @access  Private
exports.updatePreferences = async (req, res, next) => {
  try {
    const preferences = req.body;

    const result = await updateNotificationPreferences(req.user._id, preferences);

    res.json({
      success: true,
      data: result.preferences,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
exports.getPreferences = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id).select('preferences');

    res.json({
      success: true,
      data: user.preferences?.notifications || {
        email: true,
        push: true,
        orderUpdates: true,
        promotions: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send test notification (development only)
// @route   POST /api/notifications/test
// @access  Private (Admin)
exports.sendTestNotification = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return next(new AppError('Test notifications not available in production', 403));
    }

    const { title, body, data } = req.body;

    const result = await sendPushNotification(req.user._id, {
      title: title || 'Test Notification',
      body: body || 'This is a test notification from RapidEats',
      data: data || {},
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
