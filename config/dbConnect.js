const mongoose = require('mongoose');

const connectDB = async () => {
  // timeout after 3 seconds
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
};

module.exports = connectDB;
