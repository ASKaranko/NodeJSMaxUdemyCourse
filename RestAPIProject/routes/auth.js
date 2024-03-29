const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth');
const User = require('../models/user');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

router.put(
    '/signup',
    body('name').trim().isString().not().isEmpty(),
    body('email')
        .isEmail()
        .withMessage('Please, enter a valid email address')
        .custom(async (email, { req }) => {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('User with this email already exists.');
            }
            return true;
        })
        .normalizeEmail(),
    body('password', 'Please, enter a valid password')
        .isLength({ min: 8 })
        .isAlphanumeric()
        .trim(),
    authController.signup
);

router.post('/login', authController.login);
router.get('/status', isAuth, authController.getStatus);
router.put('/status', isAuth, authController.updateStatus);

module.exports = router;
