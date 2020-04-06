/* eslint-disable node/no-unsupported-features/es-syntax */
const Tour = require('../models/tourModel');
const { catchAsync } = require('../utils/CatchAsync');
const {
  createOne,
  readOne,
  readAll,
  updateOne,
  deleteOne,
} = require('./handlerFactory');
//Find best tours -  Read : path api/v1/tours/best-deals
exports.topTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' }, //group by difficulty
        // sub group under here
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        totalRatings: { $sum: '$ratingsQuantity' },
        totalTours: { $sum: 1 },
      },
    },
    {
      $sort: {
        avgPrice: 1, //sort by avgPrice from group stager
      },
    },
    // exclude the easy ones
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
//Find all the tours - Read
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();

//   const tours = await features.query;
//   res.status(200).json({
//     status: 'success',
//     result: tours.length,
//     data: { tours },
//   });
// });
exports.getAllTours = readAll(Tour);
//Create New Tour - Create
exports.postNewTour = createOne(Tour, { path: 'reviews' });

//Find single tour - Read
exports.getSingleTour = readOne(Tour);

//Update single tour - Update
exports.patchSingleTour = updateOne(Tour);

//Deleting a document - Delete
exports.deleteSinglTour = deleteOne(Tour);

//Getting monthly Planner - tours/best-deals
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', // gets the dates from array and displays all records
    },
    {
      $match: {
        startDates: {
          $gt: new Date(`${year}-01-01`),
          $lt: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numOfTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: {
        numOfTours: -1,
      },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
