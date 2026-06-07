const dotenv = require('dotenv').config();
const express = require('express');
const redisClient = require('./config/redisClient');

// sync global error handler
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception Error: ' + err.stack);
  process.exit(1);
});

const app = express();
const connectDB = require('./config/dbConnect');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
// add cors

// trust poxy
app.set('trust proxy', 1);
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
// app.set('query parser', 'extended');
app.use(cookieParser());

app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    max: 300, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
  }),
);
// static route /public
// app.use('/public', express.static('public'));
app.use(express.static('public'));
app.use(morgan('dev'));
app.use(helmet());
app.use('/api/v1', require('./routes/v1.routes'));

// glboal route
app.use(notFound);

// global error handler
app.use(errorHandler);

app.listen(process.env.PORT || 3000, () => {
  connectDB();
  redisClient.connect();
  console.log('running on port ' + process.env.PORT);
});

// async global error handler
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection Error: ' + err.stack);
  process.exit(1);
});
