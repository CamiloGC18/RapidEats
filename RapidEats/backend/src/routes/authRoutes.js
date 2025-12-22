const express = require('express');
const passport = require('passport');
const {
  googleCallback,
  refreshAccessToken,
  logout,
  getProfile,
  updateProfile,
} = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');
const { validate, schemas } = require('../utils/validation');

const router = express.Router();

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/auth/error`,
    session: false 
  }),
  googleCallback
);

router.post('/refresh', authLimiter, refreshAccessToken);
router.post('/logout', verifyToken, logout);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, validate(schemas.updateProfile), updateProfile);

module.exports = router;
