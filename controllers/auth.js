const User = require("../models/user");
const { validationResult } = require("express-validator");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("Validation failed.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    const hashPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email: email,
      password: hashPassword,
      name: name,
    });

    await user.save();

    res.status(201).json({ message: "User created!" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    console.log(email);
    const user = await User.findOne({ email: email });

    if (!user) {
      const error = new Error("User with this email could not be found");
      error.statusCode = 401;
      throw error;
    }

    const comparePassowrd = await bcrypt.compare(password, user.password);

    if (!comparePassowrd) {
      const error = new Error("Wrong password");
      error.statusCode = 401;
      throw error;
    }

    // Create token for user data
    const token = jwt.sign(
      { email: user.email, userId: user._id.toString() },
      "secret",
      {
        expiresIn: "1h",
      }
    );

    await res.status(200).json({ token: token, userId: user._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ status: user.status });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const newStatus = req.body.status;
    console.log(newStatus);
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    user.status = newStatus;

    await user.save();

    res.status(200).json({ message: "User updated." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
