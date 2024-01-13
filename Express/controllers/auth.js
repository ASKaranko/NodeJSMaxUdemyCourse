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
    // save is usually called automatically, but in this case we need to make sure
    // that the session is saved before we redirect the user
    req.session.save((err) => {
        console.log(err);
        res.redirect('/');
    });
};

exports.postLogout = async (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
};
