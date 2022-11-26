const express = require('express')

const { body } = require('express-validator')

const authController = require('../controllers/auth')
const User = require('../models/user')
const isAuth = require('../middleware/isAuth')

const router = express.Router()

router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .custom(async (value, { req }) => {
        const userDoc = await User.findOne({ email: value })

        if (userDoc) return Promise.reject('E-mail address already exists.')
      })
      .normalizeEmail(),
    body('password').trim().isLength({ min: 7 }),
    body('name').trim().not().isEmpty(),
  ],

  authController.signup
)

router.post('/login', authController.login)

router.get('/status', isAuth, authController.getUserStatus)

router.patch(
  '/status',
  isAuth,
  [body('status').trim().not().isEmpty()],
  authController.updateUserStatus
)

module.exports = router
