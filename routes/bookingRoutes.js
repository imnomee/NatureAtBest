const express = require('express');
const router = express.Router();
const {
  getCheckoutSession,
  createBooking,
  getBooking,
  getAllBookings,
  updateBooking,
  deletBooking,
} = require('../controllers/bookingControllers.js');
const { protect, restrictTo } = require('../controllers/authControllers');

router.use(protect);
router.get('/checkout-session/:tourId', getCheckoutSession);
router.use(restrictTo('admin', 'lead-guide'));
router.route('/').get(getAllBookings).post(createBooking);

router.route('/:id').get(getBooking).patch(updateBooking).delete(deletBooking);
module.exports = router;
