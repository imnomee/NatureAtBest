/* eslint-disable */

const AppErrors = require('../utils/AppErrors');

const devError = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    res.status(404).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};

const prodError = (err, req, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR', err);
    res.status(500).json({ status: err.name, message: 'Something went wrong' });
  }
};

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppErrors(400, message);
};

const handleDuplicates = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppErrors(403, message);
};

const handlValidation = (err) => {
  const errors = Object.values(err.errors).map((error) => error.message);
  const message = `Invalid Input Data: ${errors.join('. ')}`;
  return new AppErrors(400, message);
};

const handleJWTError = () => {
  const message = 'Invalid Token. Please login again';
  return new AppErrors(401, message);
};

module.exports.globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    devError(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    //Invalid ID
    if (error.name === 'CastError') {
      error = handleCastError(error);
    }

    //DUplicate
    if (error.code === 11000) {
      error = handleDuplicates(error);
    }

    if (error.name === 'ValidationError') {
      error = handlValidation(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError(error);
    }
    prodError(error, req, res);
  }
};
