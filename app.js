const path = require('path');
const express = require('express'); //require express
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const sanitizer = require('express-mongo-sanitize');
const cleaner = require('xss-clean'); //xss
const hpp = require('hpp');
const AppErrors = require('./utils/AppErrors');

//Routes
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

//Middlwares
const app = express(); //create app from express

//pug settings
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

const { globalErrorHandler } = require('./controllers/errorControllers');

//set Security HTTP headers
app.use(helmet()); //use helmet in start or over other middlwares for headers

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Limit Request from same API to limit the requests made to app
const limiter = rateLimit({
  max: 30, //max 30 requests
  windowMs: 60 * 60 * 1000, //in one hour
  message: 'Too many requests from your IP please try again in an hour.',
});

app.use('/api', limiter);

//body parser, reading data from the body, limit the body size to 10kb
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//Data sanitization against noSQL query injection
app.use(sanitizer());

//Data sanitization against XSS
app.use(cleaner());

//Http parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use((req, res, next) => {
  res.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

///If not routes match
app.all('*', (req, res, next) => {
  const err = new AppErrors(
    404,
    `Cant find ${req.originalUrl} on this Server!`
  );
  next(err);
});

//Error handler
app.use(globalErrorHandler);

module.exports = app;
