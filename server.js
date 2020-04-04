const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

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

/*
environment variables available at
>> console.log(process.env);
*/
//Listener
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('Listening on:', port);
});

process.on('unhandledRejection', (err) => {
  console.log(err.message, err.name);
  console.log('Unhandled Rejection, Shutting DOwn....');
  // server.close(() => {
  //   process.exit(1);
  // });
});
