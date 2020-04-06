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

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), setTourUserIds, createReview);

router
  .route('/:id')
  .get(getSingleReview)
  .patch(updateReview)
  .delete(deleteSingleReview);

module.exports = router;
