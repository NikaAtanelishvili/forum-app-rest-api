const express = require("express");

const { body } = require("express-validator");

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .custom(async (value, { req }) => {
        const userDoc = await User.findOne({ email: value });

        if (userDoc) return Promise.reject("E-mail address already exists.");
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],

  authController.signup
);

module.exports = router;
