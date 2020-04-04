const User = require('../models/userModel');
const AppErrors = require('../utils/AppErrors');
const { catchAsync } = require('../utils/CatchAsync');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  console.log(newObj);
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    result: users.length,
    data: { users },
  });
});

exports.postNewUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'postNewUser: This route is not yet defined',
  });
};

exports.getSingleUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'postNewUser: This route is not yet defined',
  });
};

exports.patchSingleUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'patchSingleUser: This route is not yet defined',
  });
};

exports.deleteSingleUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'deleteSingleUser: This route is not yet defined',
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //Create error if user tries to update password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppErrors(
        401,
        'This route is not to update password. use /updateMyPassword'
      )
    );
  }
  //update user data // filtered out unwanted fields
  const filteredBody = filterObj(req.body, 'email', 'name');

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'deleted',
    data: null,
  });
});
