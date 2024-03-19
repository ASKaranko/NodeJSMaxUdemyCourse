const User = require('../models/user');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

module.exports = {
    createUser: async function ({ userInput }) {
        const errors = [];
        if (!validator.isEmail(userInput.email)) {
            errors.push({ message: 'Email is invalid' });
        }
        if (
            validator.isEmpty(userInput.password) ||
            !validator.isLength(userInput.password, { min: 5 })
        ) {
            errors.push({ message: 'Password too short' });
        }
        if (errors.length > 0) {
            const error = new Error('Invalid input');
            error.data = errors;
            error.code = 422;
            throw error;
        }
        const existingUser = await User.findOne({ email: userInput.email });
        if (existingUser) {
            throw new Error('User exists already!');
        }
        const name = userInput.name;
        const email = userInput.email;
        const password = userInput.password;
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await new User({
            name,
            email,
            password: hashedPassword
        }).save();
        return {
            ...user._doc,
            _id: user._id.toString()
        };
    },
    login: async function ({ email, password }) {
        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error('User not found');
            error.code = 401;
            throw error;
        }

        const doMatch = await bcrypt.compare(password, user.password);
        if (!doMatch) {
            const error = new Error('Password is incorrect');
            error.code = 401;
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
        return {
            token,
            userId: user._id.toString()
        };
    }
};
