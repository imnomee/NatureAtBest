const express = require('express');

const router = express.Router({ mergeParams: true });
const {
  setTourUserIds,
  getAllReviews,
  getSingleReview,
  createReview,
  updateReview,
  deleteSingleReview,
} = require('../controllers/reviewControllers');

const { protect, restrictTo } = require('../controllers/authControllers');

router.use(protect);
router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourUserIds, createReview);

router
  .route('/:id')
  .get(getSingleReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteSingleReview);

module.exports = router;
