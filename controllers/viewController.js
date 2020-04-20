const Tour = require('../models/tourModel');
const { catchAsync } = require('../utils/CatchAsync');
const AppErrors = require('../utils/AppErrors');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('overview', { title: 'Tours', tours });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //Get tour data from the requested tour including reviews and tour guides
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new AppErrors(404, 'Page Not Foudn'));
  }

  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour,
  });
});

exports.login = (req, res) => {
  res.status(200).render('login', {
    title: '.. Log in to your account ..',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
};
const Booking = require('../models/bookingModel');
exports.getMyTours = catchAsync(async (req, res, next) => {
  //find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  //find tours with the returned IDs
  const tourIDs = bookings.map((bookings) => bookings.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
const User = require('../models/userModel');
exports.updateUser = catchAsync(async (req, res) => {
  console.log(req.body);
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.username,
      email: req.body.userEmail,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'Your Account',
    user: updatedUser,
  });
});
