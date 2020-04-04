const express = require('express');
const {
  getAllUsers,
  postNewUser,
  getSingleUser,
  patchSingleUser,
  deleteSingleUser,
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
router.patch('/updatepassword', protect, updatePassword);

router.delete('/deleteMe', protect, deleteMe);

router.patch('/updateMe', protect, updateMe);

router.route('/').get(protect, getAllUsers).post(postNewUser);
router
  .route('/:id')
  .get(getSingleUser)
  .patch(patchSingleUser)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteSingleUser);

module.exports = router;
