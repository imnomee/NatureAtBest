const express = require('express'); //require express
const morgan = require('morgan');
const AppErrors = require('./utils/AppErrors');

//Routes
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

//Middlwares
const app = express(); //create app from express
const { globalErrorHandler } = require('./controllers/errorControllers');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
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
