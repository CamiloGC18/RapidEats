const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  registerToken,
  unregisterToken,
  updatePreferences,
  getPreferences,
  sendTestNotification,
} = require('../controllers/notificationController');

// All notification routes require authentication
router.use(authenticate);

router.post('/token', registerToken);
router.delete('/token', unregisterToken);
router.get('/preferences', getPreferences);
router.patch('/preferences', updatePreferences);

// Test route (admin only, development)
router.post('/test', authorize('admin'), sendTestNotification);

module.exports = router;
