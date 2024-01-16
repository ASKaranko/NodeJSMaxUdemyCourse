const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.getLogin = async (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: req.session.isLoggedIn
    });
};

exports.postLogin = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user = await User.findOne({ email });
        if (!user) {
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
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: false
    });
};

exports.postSignup = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
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
