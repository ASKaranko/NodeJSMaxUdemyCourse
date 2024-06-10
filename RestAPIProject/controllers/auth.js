const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        console.log('🚀 ~ exports.signup= ~ errors:', errors);
        if (!errors.isEmpty()) {
            const error = new Error(
                'Validation failed. Please, enter data in correct format'
            );
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }

        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await new User({
            name,
            email,
            password: hashedPassword,
            posts: []
        }).save();
        res.status(201).json({ message: 'User created!', userId: user._id });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error(
                'A user with this email could not be found'
            );
            error.statusCode = 401;
            throw error;
        }
        const doMatch = await bcrypt.compare(password, user.password);
        if (!doMatch) {
            const error = new Error('Wrong password');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            {
                email: user.email,
                userId: user._id.toString()
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );
        res.status(200).json({ token, userId: user._id.toString() });
        return;
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
        return error;
    }
};

exports.getStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error(
                'A user was not found. Status is undefined'
            );
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: 'Status fetched.',
            status: user.status
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error(
                'A user was not found. Status is undefined'
            );
            error.statusCode = 404;
            throw error;
        }
        user.status = req.body.status;
        await user.save();
        res.status(200).json({
            message: 'Status Updated.',
            status: user.status
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};
