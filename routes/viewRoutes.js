const express = require('express');
const { protect, isLoggedIn } = require('../controllers/authControllers');
const { createBookingCheckout } = require('../controllers/bookingControllers');
// const { protect } = require('../controllers/authControllers')
const {
  getOverview,
  getTour,
  login,
  getAccount,
  getMyTours,
} = require('../controllers/viewController');

const router = express.Router();

router.get('/', createBookingCheckout, isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, login);
router.get('/me', protect, getAccount);
router.get('/my-tours', protect, getMyTours);

// router.post('/submit-user-data', protect, updateUser);

module.exports = router;
