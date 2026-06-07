const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');
const redisClient = require('../config/redisClient');
const redisKey = require('../utils/redisKey');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');

// getAllUsers
exports.getAllUsers = asyncHandler(async (req, res) => {
  let users = [];
  users = JSON.parse(await redisClient.get(redisKey.users));

  if (!users) {
    users = await User.find();
    await redisClient.set(redisKey.users, JSON.stringify(users), { EX: 5 });
  }

  res.status(200).json({
    ok: true,
    results: users.length,
    data: users,
  });
});

// testing

// create user
exports.createUser = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;

  // Check if a user with the same account already exists
  const existingUser = await User.findOne({ account: req.user.id });
  if (existingUser) {
    throw new AppError('User already exists', 400);
  }

  const user = await User.create({
    account: req.user.id,
    name,
    phone,
    address,
  });

  res.status(201).json({
    ok: true,
    message: 'User created successfully',
    data: user,
  });
});
