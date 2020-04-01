const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
    },

    secretTour: {
      type: Boolean,
      default: false,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Tour Duration??'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Group Size??'],
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty??'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Description ??'],
    },
    imageCover: {
      type: String,
      required: true,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    startLocation: {
      description: {
        type: String,
      },
      type: String,
      coordinates: [Number],
      address: {
        type: String,
        require: [true, 'StartLocation / Address ??'],
        trim: true,
      },
      guides: [String],
    },
  },

  { timestamps: true, toJSON: { virtuals: true } } //It will show default timestamps
);

//Virtual property which is not actually a part of schema
tourSchema.virtual('durationWeeks').get(function () {
  //getting duration from the tourSchema. Original duration is in days.
  //here we are converting it to get weeks.
  return this.duration / 7;
});

//Document middlware: runs before save and create command
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function (next) {
//   console.log('Will save document, ');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//Query Middlware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  // console.log(doc);
  console.log(`Query took ${Date.now() - this.start} ms`);

  next();
});

//Aggregation middlware
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({
//     $match: { secretTour: { $ne: true } },
//   });
//   console.log(this.pipeline());
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
