const express = require('express');
const { protect } = require('../controllers/authControllers')
const {
  getOverview,
  getTour,
  login,
} = require('../controllers/viewController');

const router = express.Router();

router.get('/', getOverview);
router.get('/tour/:slug', protect, getTour);
router.get('/login', login);

module.exports = router;
