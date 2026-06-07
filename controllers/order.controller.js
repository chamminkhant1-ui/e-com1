const Order = require('../models/order.model');
const User = require('../models/user.model');
const asyncHandler = require('express-async-handler');
const AppError = require('../utils/AppError');
const Product = require('../models/product.model');

// {products: [{ product: 1, quantity: 2 }, { product: 2, quantity: 1 }]} = req.body
// exports.createOrder = asyncHandler(async (req, res, next) => {
//   const { products } = req.body;
//   console.log('Received order request with products:', products);
//   // 1. check products exist
//   if (!products || !Array.isArray(products) || products.length === 0) {
//     return next(new AppError('Products are required', 400));
//   }

//   // 2. check stock and calculate total amount
//   let totalAmount = 0;
//   const orderProducts = [];

//   for (const item of products) {
//     const product = await Product.findById(item.product);

//     // check product exist
//     if (!product) {
//       return next(new AppError(`Product ${item.product} not found`, 404));
//     }
//     // check stock
//     if (product.stock < item.quantity) {
//       return next(new AppError(`Product ${item.product} is out of stock`, 400));
//     }
//     totalAmount += product.price * item.quantity;

//     orderProducts.push({
//       product: product._id,
//       quantity: item.quantity,
//       priceAtPurchase: product.price,
//     });
//   }

//   // 3. check user balance
//   const user = await User.findOne({ account: req.user.id });
//   if (!user) {
//     return next(new AppError('User not found', 404));
//   }
//   if (user.balance < totalAmount) {
//     return next(new AppError('Insufficient balance', 400));
//   }
//   // 4. create order
//   const order = await Order.create({
//     user: user._id,
//     products: orderProducts,
//     totalAmount,
//   });

//   // 5. update stock and user balance
//   for (const item of orderProducts) {
//     const product = await Product.findById(item.product);
//     product.stock -= item.quantity;
//     await product.save();
//   }

//   user.balance -= totalAmount;
//   await user.save();

//   res.status(201).json({
//     status: 'success',
//     data: {
//       order,
//     },
//   });
// });

// exports.createOrder = asyncHandler(async (req, res, next) => {
//   const { products } = req.body;
//   console.log('Received order request with products:', products);
//   // 1. check products exist
//   if (!products || !Array.isArray(products) || products.length === 0) {
//     return next(new AppError('Products are required', 400));
//   }

//   // 2. check stock and calculate total amount
//   let totalAmount = 0;
//   const orderProducts = [];

//   // race condition: if two orders are created at the same time, they may both check stock before updating it, which can lead to overselling. To prevent this, we can use transactions or locks. For simplicity, we will just check stock again before updating it.
//   for (const item of products) {
//     // if product 1 has only 1 stock
//     // const product = await Product.findById(item.product);
//     const product = await Product.findOneAndUpdate(
//       { _id: item.product, stock: { $gte: item.quantity } },
//       { $inc: { stock: -item.quantity } },
//       { new: true },
//     );

//     // check product exist
//     if (!product) {
//       // restore stock for previous products
//       for (const prevItem of orderProducts) {
//         await Product.findByIdAndUpdate(prevItem.product, {
//           $inc: { stock: prevItem.quantity },
//         });
//       }
//       return next(
//         new AppError(
//           `Product ${item.product} not found or not enough stock`,
//           404,
//         ),
//       );
//     }

//     totalAmount += product.price * item.quantity;

//     orderProducts.push({
//       product: product._id,
//       quantity: item.quantity,
//       priceAtPurchase: product.price,
//     });
//   }

//   // 3. check user balance
//   const user = await User.findOne({ account: req.user.id });
//   if (!user) {
//     return next(new AppError('User not found', 404));
//   }
//   if (user.balance < totalAmount) {
//     // restore stock for all previous products
//     for (const prevItem of orderProducts) {
//       await Product.findByIdAndUpdate(prevItem.product, {
//         $inc: { stock: prevItem.quantity },
//       });
//     }
//     return next(new AppError('Insufficient balance', 400));
//   }
//   // 4. create order
//   const order = await Order.create({
//     user: user._id,
//     products: orderProducts,
//     totalAmount,
//   });

//   user.balance -= totalAmount;
//   await user.save();

//   res.status(201).json({
//     status: 'success',
//     data: {
//       order,
//     },
//   });
// });

// ACID properties:
// 1. Atomicity: either all operations succeed or none do. In our case, if any step fails (e.g., product not found, insufficient stock, insufficient balance), we roll back all previous operations (e.g., restoring stock for previously processed products).
// 2. Consistency: the database remains in a consistent state before and after the transaction. In our case, we ensure that stock levels and user balances are correctly updated, and that orders are only created if all conditions are met.
// 3. Isolation: concurrent transactions do not interfere with each other. In our case, we check stock levels again before updating
// 4. Durability: once a transaction is committed, it will remain so, even in the case of a system failure. In our case, once the order is created and stock/user balance is updated, it will persist in the database.

exports.createOrder = asyncHandler(async (req, res, next) => {
  const { products } = req.body;
  const session = await Order.startSession();
  session.startTransaction();
  const orderProducts = [];
  let totalAmount = 0;
  try {
    for (const item of products) {
      const product = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { returnDocument: 'after', session },
      );

      if (!product) {
        throw new AppError(
          `Product ${item.product} not found or not enough stock`,
          404,
        );
      }
      orderProducts.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });
      totalAmount += product.price * item.quantity;
    }

    const user = await User.findOneAndUpdate(
      { account: req.user.id, balance: { $gte: totalAmount } },
      { $inc: { balance: -totalAmount } },
      { returnDocument: 'after', session },
    );
    if (!user) {
      throw new AppError('Insufficient balance', 400);
    }

    const order = await Order.create(
      [
        {
          user: user._id,
          products: orderProducts,
          totalAmount,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    res.status(201).json({
      status: 'success',
      data: {
        order: order[0],
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }

  // when session ends, it will automatically end transaction, so we don't need to call session.endSession() explicitly

  // session.commitTransaction() will commit the transaction, and session.abortTransaction() will roll back the transaction. We will call session.commitTransaction() at the end of the try block, and call session.abortTransaction() in the catch block.
  // session.abortTransaction() will roll back all operations performed in the transaction, so we don't need to manually restore stock or user balance in case of an error. This ensures that our operations are atomic and consistent.
});
