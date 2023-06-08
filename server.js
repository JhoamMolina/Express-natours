const mongoose = require('mongoose');
const dotenv = require('dotenv');

// for rest of the unhanlded promisess
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION');
  process.exit(1);
});

dotenv.config({
  path: './config.env',
});

mongoose.set('strictQuery', true);

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection succesful!');
  });

const port = process.env.POR || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// for server
process.on('unhandledRejection', (err) => {
  console.log('UNAHNDLER REECTINO');
  server.close(() => {
    process.exit(1);
  });
});
