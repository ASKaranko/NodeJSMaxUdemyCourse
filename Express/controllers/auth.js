const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.getLogin = async (req, res, next) => {
    const message = req.flash('error');
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: message.length > 0 ? message[0] : null
    });
};

exports.postLogin = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }
        const doMatch = await bcrypt.compare(password, user.password);
        if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            // save is usually called automatically, but in this case we need to make sure
            // that the session is saved before we redirect the user
            return await req.session.save((err) => {
                console.log(err);
                res.redirect('/');
            });
        }
        req.flash('error', 'Invalid email or password.');
        res.redirect('/login');
    } catch (err) {
        console.log(err);
        res.redirect('/login');
    }
};

exports.postLogout = async (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
};

exports.getSignup = (req, res, next) => {
    const message = req.flash('error');
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message.length > 0 ? message[0] : null
    });
};

exports.postSignup = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'User with this email already exists.');
            return res.redirect('signup');
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        await new User({
            email,
            password: hashedPassword,
            cart: { items: [] }
        }).save();
        res.redirect('/login');
    } catch (err) {
        console.log(err);
    }
};
