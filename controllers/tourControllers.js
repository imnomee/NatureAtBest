/* eslint-disable node/no-unsupported-features/es-syntax */
const Tour = require('../models/tourModel');
const AppErrors = require('../utils/AppErrors');
const { catchAsync } = require('../utils/CatchAsync');
const {
  createOne,
  readOne,
  readAll,
  updateOne,
  deleteOne,
} = require('./handlerFactory');
//Find best tours -  Read : path api/v1/tours/best-deals

const multer = require('multer');
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppErrors(400, 'Not an image, please upload only images'), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.tourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
// upload.array('images', 5);

exports.resizeTourImages = catchAsync(async (res, req, next) => {
  // console.log(req.files);
  if (!req.files.imageCover || !req.files.images) {
    return next();
  }

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, index) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;
      sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );

  next();
});

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
exports.getAllTours = readAll(Tour);
//Create New Tour - Create
exports.postNewTour = createOne(Tour);

//Find single tour - Read
exports.getSingleTour = readOne(Tour, {
  path: 'reviews',
  select: '-__v',
});

//Update single tour - Update
exports.patchSingleTour = updateOne(Tour);

//Deleting a document - Delete
exports.deleteSingleTour = deleteOne(Tour);

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

//Get tours within a geo area
// /tours-distance/233/center/-40,45/unit/mi;
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(new AppErrors(400, 'Please provide coords in the format lat,lng'));
  }
  console.log(distance, lat, lng, unit);
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(new AppErrors(400, 'Please provide coords in the format lat,lng'));
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        // spherical: true,
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  console.log(distances);
  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      distances,
    },
  });
});
