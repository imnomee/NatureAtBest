const Tour = require('../models/tourModel');
const { catchAsync } = require('../utils/CatchAsync');
const AppError = require('../utils/AppErrors');
const {
  createOne,
  readOne,
  readAll,
  updateOne,
  deleteOne,
} = require('../controllers/handlerFactory');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/bookingModel');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //get current booked tour
  const tour = await Tour.findById(req.params.tourId);
  //create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],

    //If the booking is successful
    // success_url: `${req.protocol}://${req.get('host')}/`,
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,

    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'gbp',
        quantity: 1,
      },
    ],
  });
  //create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) {
    return next();
  }
  await Booking.create({ tour, user, price });
  res.redirect(`${req.protocol}://${req.get('host')}/my-tours`);
});

exports.createBooking = createOne(Booking);
exports.getBooking = readOne(Booking);
exports.getAllBookings = readAll(Booking);
exports.updateBooking = updateOne(Booking);
exports.deletBooking = deleteOne(Booking);
