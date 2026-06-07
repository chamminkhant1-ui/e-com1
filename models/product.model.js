const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return v >= 0;
        },
        message: 'Price cannot be negative',
      },
    },
    stock: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return v >= 0;
        },
        message: 'Stock cannot be negative',
      },
    },
    filename: {
      type: String,
      required: false,
      unique: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Product', productSchema);
