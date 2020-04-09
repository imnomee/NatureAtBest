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
  deleteSingleTour,
  getToursWithin,
  getDistances,
} = require('../controllers/tourControllers');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

/*
example: 
/tours-distance/233/center/-40,45/unit/mi

*/
router
  .route('/tours-within/:distance/center/:latlng/:unit')
  .get(getToursWithin);

router.route('/distances/:latlng/:unit').get(getDistances);
router.use('/:tourId/reviews', reviewRouter);
router
  .route('/plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router.route('/best-deals').get(topTours, getAllTours);
router.route('/tour-stats').get(getTourStats);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), postNewTour);

router
  .route('/:id')
  .get(getSingleTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), patchSingleTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteSingleTour);

module.exports = router;
