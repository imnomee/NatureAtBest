const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const AppErrors = require('../utils/AppErrors');
const { catchAsync } = require('../utils/CatchAsync');
const sendEmail = require('../utils/Email');


const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  //creating and sending cookie with response
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true, //without production env it wont be send
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined; //remove the password from the output
  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  //   const newUser = await User.create(req.body); //insecure way. not recommended
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
    active: req.body.active,
  });

  //   const token = signToken(newUser._id);
  //   const user = await User.findById(newUser._id);
  createSendToken(newUser, 201, res);
  //   res.status(201).json({
  //     status: 'success',
  //     token,
  //     data: {
  //       user,
  //     },
  //   });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email,password } = req.body;
  //if emailand password correct

  if (!email || !password) {
    return next(new AppErrors(400, 'Please provide valid email and password'));
  }

  //if user exist and password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppErrors(401, 'Incorrect Email or password'));
  }
  //send token
  createSendToken(user, 200, res);
  
});

//Protect routes
exports.protect = catchAsync(async (req, res, next) => {
  // Get the token and check if its there
  const { authorization } = req.headers;
  let token;
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }
  // console.log('token', token);

  if (!token) {
    return next(
      new AppErrors(
        401,
        'You are not logged in. Please login to access the results'
      )
    );
  }

  //Validate the token
  //Promisify didn't work here for me so i used normal await
  //   const decoded = promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  //check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppErrors(401, 'User No longer exists'));
  }

  //if user changed password if token was issued
  //   console.log(currentUser.checkPasswordChange(decoded.iat));
  if (currentUser.checkPasswordChange(decoded.iat)) {
    return next(
      new AppErrors(401, 'Your password was changed recently, login again')
    );
  }

  //Grant access to protected route
  req.user = currentUser;
  next();
});

//Restirct update and deletion to following users
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppErrors(401, 'You do not have permission to perform this action')
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppErrors(404, 'No User with that email address'));
  }
  //generate random reset token
  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/resetpassword/${resetToken}`;
  const message = `Forgot your password? submit a Patch request with your new password#
  and password confirm to: ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password Reset Token valid for 10 Min',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppErrors(500, 'There was an error sending email'));
  }

  //   next();
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //Get user based on the token
  const hashedToken = await crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    //check if the token is not expired

    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppErrors(400, 'Token is invalid or expired.'));
  }

  //set new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  //update the changedPasswordAt property
  //Log the user in and send JWT

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //get user from collection
  const user = await User.findById(req.user.id).select('+password');
  //check if the currentpassword is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppErrors(401, 'Your current password is wrong'));
  }
  //update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //log back in with new token
  createSendToken(user, 200, res);
});
