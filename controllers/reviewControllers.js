const Review = require('../models/reviewModel');
const {
  createOne,
  readOne,
  readAll,
  updateOne,
  deleteOne,
} = require('./handlerFactory');

exports.getAllReviews = readAll(Review);
exports.getSingleReview = readOne(Review);
exports.setTourUserIds = (req, res, next) => {
  //allowed nested routes

  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }

  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  next();
};
exports.createReview = createOne(Review);

exports.updateReview = updateOne(Review);
exports.deleteSingleReview = deleteOne(Review);
