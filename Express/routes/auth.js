const express = require('express');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);
router.post(
    '/login',
    body('email', 'Please, enter a valid email address').isEmail(),
    body('password', 'Please, enter a valid password')
        .isLength({ min: 8 })
        .isAlphanumeric(),
    authController.postLogin
);
router.post('/logout', authController.postLogout);
router.get('/signup', authController.getSignup);
router.post(
    '/signup',
    check('email')
        .isEmail()
        .withMessage('Please, enter a valid email address')
        .custom(async (email, { req }) => {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('User with this email already exists.');
            }
            return true;
        }),
    body(
        'password',
        'Please, enter a valid password. It must have numbers and text and be at least 8 characters long'
    )
        .isLength({ min: 8 })
        .isAlphanumeric(),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords not matched');
        }
        return true;
    }),
    authController.postSignup
);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
