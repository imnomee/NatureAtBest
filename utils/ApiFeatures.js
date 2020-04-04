/* eslint-disable node/no-unsupported-features/es-syntax */
class APIFeatures {
  //queryString is req.query
  //query is query we pass to database
  constructor(document, queryString) {
    this.query = document;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select({
        path: fields,
        select: '-__v -durationWeeks',
      });
      // this.query.durationWeeks = undefined;
    } else {
      this.query = this.query.select('-__v -durationWeeks');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit); //skip is the start number of start and limit is 10 over that

    return this;
  }
}

module.exports = APIFeatures;
