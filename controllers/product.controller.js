const asyncHandler = require('express-async-handler');
const Product = require('../models/product.model');
const AppError = require('../utils/AppError');
const ApiFeatures = require('../utils/ApiFeatures');
const redisClient = require('../config/redisClient');
const redisKey = require('../utils/redisKey');

// 1. create product
exports.createProduct = asyncHandler(async (req, res, next) => {
  const { name, description, price, stock } = req.body;
  console.log(req.file);
  if (!name || !description || price === undefined || stock === undefined) {
    return next(new AppError('All fields are required', 400));
  }

  const product = new Product({
    name,
    description,
    price,
    stock,
    filename: req.file ? req.file.filename : undefined,
  });

  const savedProduct = await product.save();

  res.status(201).json({
    ok: true,
    message: 'Product created successfully',
    data: savedProduct,
  });
});
// 2. get all products
// exports.getAllProducts = asyncHandler(async (req, res, next) => {
//   // 1. filtering (Express extended parser already handles bracket syntax)
//   const filter = { ...req.query };
//   const excludeFields = ['page', 'sort', 'limit', 'fields'];
//   excludeFields.forEach((field) => delete filter[field]);

//   // 2. sorting
//   let sortBy = '-createdAt';
//   if (req.query.sort) {
//     sortBy = req.query.sort.split(',').join(' ');
//     console.log(sortBy);
//   }

//   // 2. pagination
//   let page = 1;
//   let limit = 10;
//   let skip = 0;
//   if (req.query.page) {
//     page = parseInt(req.query.page) || 1;
//     limit = parseInt(req.query.limit) || 10;
//     skip = (page - 1) * limit;
//     // if page 1, 1 - 10, skip 0
//     // if page 2, 11 - 20, skip 10
//     // if page 3, 21 - 30, skip 20
//   }

//   // 3. limits
//   let fields = '';
//   if (req.query.fields) {
//     fields = req.query.fields.split(',').join(' ');
//   }

//   const products = await Product.find(filter)
//     .skip(skip)
//     .limit(limit)
//     .select(fields)
//     .sort(sortBy);

//   res.status(200).json({
//     ok: true,
//     message: 'Products retrieved successfully',
//     count: products.length,
//     data: products,
//   });
// });

//  cacheing
// 1.in-memory cache (node-cache)
// 2. redis cache (redis server)
exports.getAllProducts = asyncHandler(async (req, res, next) => {
  // console.log(req.query); // Log the query parameters
  // const features = new ApiFeatures(Product.find(), req.query)
  //   .filter()
  //   .sort()
  //   .limitFields()
  //   .paginate();

  let products = {};

  products = JSON.parse(await redisClient.get(redisKey.products));
  if (!products) {
    products = await Product.find();
    if (req.query.page < 3) {
      await redisClient.set(redisKey.products, JSON.stringify(products), {
        EX: 60, // expire in 60 seconds
      });
    }
  }

  res.status(200).json({
    ok: true,
    results: products.length,
    data: products,
  });
});

// invalidate cache when product is created, updated, deleted
// redisClient.del(redisKey.products);

// exports.getAllProducts = asyncHandler(async (req, res, next) => {
//   const features = new ApiFeatures(Product.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const products = await features.query;

//   res.status(200).json({
//     ok: true,
//     message: 'Products retrieved successfully',
//     count: products.length,
//     data: products,
//   });
// });

// 3. get product by id
exports.getProductById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let product = {};
  product = JSON.parse(await redisClient.get(redisKey.product(id)));
  if (!product) {
    product = await Product.findById(id);
    await redisClient.set(redisKey.product(id), JSON.stringify(product), {
      EX: 60, // expire in 60 seconds
    });
  }

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    ok: true,
    message: 'Product retrieved successfully',
    data: product,
  });
});
// 4. update product by id
// 5. delete product by id`
