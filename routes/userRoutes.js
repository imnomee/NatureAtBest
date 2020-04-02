const express = require('express');
const {
  getAllUsers,
  postNewUser,
  getSingleUser,
  patchSingleUser,
  deleteSingleUser,
} = require('../controllers/userControllers');

const router = express.Router();

router.route('/').get(getAllUsers).post(postNewUser);
router
  .route('/:id')
  .get(getSingleUser)
  .patch(patchSingleUser)
  .delete(deleteSingleUser);

module.exports = router;
