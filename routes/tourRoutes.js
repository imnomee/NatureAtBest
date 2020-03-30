const fs = require('fs');
const express = require('express');
const {
  checkTourId,
  getAllTours,
  checkTourBody,
  postNewTour,
  getSingleTour,
  patchSingleTour,
  deleteSinglTour
} = require('../controllers/tourControllers');

const router = express.Router();

router.param('id', checkTourId);

router
  .route('/')
  .get(getAllTours)
  .post(checkTourBody, postNewTour);

router
  .route('/:id')
  .get(getSingleTour)
  .patch(patchSingleTour)
  .delete(deleteSinglTour);

module.exports = router;
