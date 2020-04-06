const { catchAsync } = require('../utils/CatchAsync');
const AppErrors = require('../utils/AppErrors');
const APIFeatures = require('../utils/ApiFeatures');

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(200).json({
      status: 'success',
      data: { data: doc },
    });
  });

exports.readOne = (Model, options) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (options) {
      query = query.populate(options);
    }
    const doc = await query;
    if (!doc) {
      return next(new AppErrors(404, 'no document found with that ID'));
    }
    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });

exports.readAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //TO allow for nested Get reviews on tour
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;
    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: { data: doc },
    });
  });
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppErrors(404, 'no tours found with that ID'));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppErrors(404, 'no document found with that ID'));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
