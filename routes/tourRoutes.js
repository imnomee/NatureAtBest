const express = require('express');
const { protect, restrictTo } = require('../controllers/authControllers');
const {
  topTours,
  getMonthlyPlan,
  getTourStats,
  getAllTours,
  postNewTour,
  getSingleTour,
  patchSingleTour,
  deleteSinglTour,
} = require('../controllers/tourControllers');

const router = express.Router();

// router.use('/:tourId/reviews', reviewRouter);
router.route('/plan/:year').get(getMonthlyPlan);
router.route('/best-deals').get(topTours, getAllTours);
router.route('/tour-stats').get(getTourStats);

router.route('/').get(protect, getAllTours).post(postNewTour);

router
  .route('/:id')
  .get(getSingleTour)
  .patch(patchSingleTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteSinglTour);

module.exports = router;
