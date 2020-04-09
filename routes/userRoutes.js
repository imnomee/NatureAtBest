const express = require('express');
const {
  getAllUsers,
  postNewUser,
  getSingleUser,
  patchSingleUser,
  deleteSingleUser,
  readMe,
  updateMe,
  deleteMe,
} = require('../controllers/userControllers');
const {
  protect,
  restrictTo,
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/authControllers');

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetpassword/:token', resetPassword);

router.use(protect); //adding this protect here will protect all routes under this point
router.delete('/deleteMe', deleteMe);
router.get('/me', readMe, getSingleUser);
router.patch('/updateMe', updateMe);
router.patch('/updatepassword', updatePassword);

router.use(restrictTo('admin'));
router.route('/').get(getAllUsers).post(postNewUser);
router
  .route('/:id')
  .get(getSingleUser)
  .patch(patchSingleUser)
  .delete(deleteSingleUser);

module.exports = router;
