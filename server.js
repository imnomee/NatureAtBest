const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

/*
environment variables available at
>> console.log(process.env);
*/
//Listener
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Listening on:', port);
});
