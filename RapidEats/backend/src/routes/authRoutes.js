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

router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;
