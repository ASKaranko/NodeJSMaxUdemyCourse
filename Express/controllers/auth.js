const User = require('../models/user');

exports.getLogin = async (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: req.session.isLoggedIn
    });
};

exports.postLogin = async (req, res, next) => {
    const user = await User.findOne({ name: 'Andrei' });
    req.session.isLoggedIn = true;
    req.session.user = user;
    res.redirect('/');
};
