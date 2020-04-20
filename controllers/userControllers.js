const User = require('../models/userModel');
const AppErrors = require('../utils/AppErrors');
const { catchAsync } = require('../utils/CatchAsync');
const { readOne, readAll, deleteOne, updateOne } = require('./handlerFactory');

///user photo upload using multer
const multer = require('multer');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     //user-user_id-currenTimestamp.jpeg
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppErrors(400, 'Not an image, please upload only images'), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.userPhoto = upload.single('photo');

const sharp = require('sharp');
exports.resizePhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 80 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};
exports.getSingleUser = readOne(User);
exports.getAllUsers = readAll(User);
exports.patchSingleUser = updateOne(User);
exports.deleteSingleUser = deleteOne(User);

exports.readMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);
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

  if (req.file) {
    filteredBody.photo = req.file.filename;
  }
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

exports.postNewUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'postNewUser: This route is defined. Please use /signup instead.',
  });
};
