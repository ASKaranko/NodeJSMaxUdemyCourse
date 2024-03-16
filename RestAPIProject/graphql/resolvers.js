const User = require('../models/user');
const bcrypt = require('bcryptjs');
const validator = require('validator');

module.exports = {
    createUser: async function ({ userInput }, req) {
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
    }
};
