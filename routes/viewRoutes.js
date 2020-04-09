const express = require('express');
const {isLoggedIn} = require('../controllers/authControllers')
// const { protect } = require('../controllers/authControllers')
const {
  getOverview,
  getTour,
  login,
} = require('../controllers/viewController');

const router = express.Router();
router.use(isLoggedIn);

router.get('/', getOverview);
router.get('/tour/:slug', getTour);
router.get('/login', login);

module.exports = router;
