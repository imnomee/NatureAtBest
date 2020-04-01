const fs = require('fs');
const Tour = require('../../models/tourModel');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: `${__dirname}/../../config.env` });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  // .connect(process.env.DATABASE_LOCAL //local database connections
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => console.log('Connected to the databases'))
  .catch((err) => console.error(err));

//Read file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

//Import data into database

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data Loaded Successfully');
  } catch (err) {
    console.error(err.message);
  }
};

//Delete all data
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('DB empty now');
  } catch (err) {
    console.error(err.message);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
console.log(process.argv);
