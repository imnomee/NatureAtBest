const express = require('express');

const router = express.Router({ mergeParams: true });
const {
  setTourUserIds,
  getAllReviews,
  createReview,
  updateReview,
  deleteSingleReview,
} = require('../controllers/reviewControllers');

const { protect, restrictTo } = require('../controllers/authControllers');

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), setTourUserIds, createReview);

router.route('/:id').patch(updateReview).delete(deleteSingleReview);
// router
//   .route('/:tourId/reviews')
//   .post(protect, restrictTo('user'), createReview);

module.exports = router;
