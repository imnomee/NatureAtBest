/* eslint-disable node/no-unsupported-features/es-syntax */
const APIFeatures = require('../utils/ApiFeatures');
const Tour = require('../models/tourModel');

//Find best tours -  Read : path api/v1/tours/best-deals
exports.topTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err.message,
    });
  }
};
//Find all the tours - Read
exports.getAllTours = async (req, res) => {
  try {
    //API features
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    //Execute the Query
    const tours = await features.query;
    res.status(200).json({
      status: 'success',
      result: tours.length,
      data: { tours },
    });
  } catch (err) {
    res.status(400).json({ status: 'failed', message: err.message });
  }
};

//Create New Tour - Create
exports.postNewTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(200).json({
      status: 'success',
      data: { newTour },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

//Find single tour - Read
exports.getSingleTour = async (req, res) => {
  try {
    // const tour = await Tour.findOne({ _id: req.params.id });
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(404).json({ status: 'not found', message: err.message });
  }
};

//Update single tour - Update
exports.patchSingleTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.json({ message: err.message });
  }
};

//Deleting a document - Delete
exports.deleteSinglTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err.message,
    });
  }
};

//Getting monthly Planner - tours/best-deals
exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    console.log(req.params.year);
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
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err.message,
    });
  }
};
