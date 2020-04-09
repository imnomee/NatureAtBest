const Tour = require('../models/tourModel');
const { catchAsync } = require('../utils/CatchAsync');

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

  //BUild template

  //render the template using data
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
