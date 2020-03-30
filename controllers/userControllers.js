const fs = require('fs');

//User Data
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
);

exports.getAllUsers = (req, res) => {
  res.status(200).json({
    status: 'success',
    result: users.length,
    data: { users }
  });
};

exports.postNewUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'postNewUser: This route is not yet defined'
  });
};

exports.getSingleUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'postNewUser: This route is not yet defined'
  });
};

exports.patchSingleUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'patchSingleUser: This route is not yet defined'
  });
};

exports.deleteSingleUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'deleteSingleUser: This route is not yet defined'
  });
};
