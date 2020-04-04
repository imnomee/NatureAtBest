const express = require('express'); //require express
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const sanitizer = require('express-mongo-sanitize');
const cleaner = require('xss-clean'); //xss
const hpp = require('hpp');
const AppErrors = require('./utils/AppErrors');

//Routes
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

//Middlwares
const app = express(); //create app from express

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

//serving static files
app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

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
