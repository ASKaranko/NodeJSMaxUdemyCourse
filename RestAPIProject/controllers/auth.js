const User = require('../models/user');
const { validationResult } = require('express-validator');

exports.signup = async (req, res, next) => {
    try {
        const errors = validationResult(req);
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
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};