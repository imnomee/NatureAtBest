const fs = require('fs');

//Tour Data
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkTourId = (req, res, next, val) => {
  if (val * 1 > tours[tours.length - 1].id) {
    return res.status(404).json({ status: 'not found', message: 'invalid id' });
  }
  next();
};

exports.checkTourBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'entry failed',
      message: 'invalid name or price'
    });
  }
  next();
};
//Tours
exports.getAllTours = (req, res) => {
  res
    .status(200)
    .json({ status: 'success', result: tours.length, data: { tours } });
};

exports.postNewTour = (req, res) => {
  //using json middlware to process the incoming data
  const newID = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newID }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      res.status(201).json({ status: 'success', data: { tour: newTour } });
    }
  );
};

exports.getSingleTour = (req, res) => {
  const id = req.params.id * 1; // its a trick to convert string of number to a int
  const tour = tours.find(tour => {
    return tour.id === id;
  });

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
};

exports.patchSingleTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: 'Updated tour here...'
    }
  });
};

exports.deleteSinglTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null
  });
};
