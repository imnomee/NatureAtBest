const express = require('express');
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

router.route('/plan/:year').get(getMonthlyPlan);
router.route('/best-deals').get(topTours, getAllTours);
router.route('/tour-stats').get(getTourStats);

router.route('/').get(getAllTours).post(postNewTour);

router
  .route('/:id')
  .get(getSingleTour)
  .patch(patchSingleTour)
  .delete(deleteSinglTour);

module.exports = router;
