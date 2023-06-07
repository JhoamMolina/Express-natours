const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const handleDuplicateFields = (err) => {
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicate field value: ${value}. Use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data, ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorProduction = (err, res) => {
  // Operational, trusted: send message to clinet
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming or other unkown error dont leak error details
  }
  // 1) Log error
  else {
    console.error('Error'),
      // 2) sSend generic message
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong',
      });
  }
};

module.exports = (err, _, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFields(err);
    if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
    sendErrorProduction(err, res);
  }
  next();
};
