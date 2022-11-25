const User = require("../models/user");
const { validationResult } = require("express-validator");

const bcrypt = require("bcryptjs");

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
    console.log("status");
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
