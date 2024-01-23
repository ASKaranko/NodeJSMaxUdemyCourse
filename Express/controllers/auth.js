const bcrypt = require('bcryptjs');
const { randomBytes } = require('crypto');
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const User = require('../models/user');
const user = require('../models/user');

const mailer = nodemailer.createTransport(
    sgTransport({
        auth: {
            api_key: process.env.SENDGRID_API_KEY
        }
    })
);

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
        await mailer.sendMail({
            to: [email],
            from: 'andr.karanko@gmail.com',
            subject: 'Signup succeeded!',
            html: '<h1>You successfully signed up!</h1>'
        });
    } catch (err) {
        console.log(err);
    }
};

exports.getReset = (req, res, next) => {
    const message = req.flash('error');
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message.length > 0 ? message[0] : null
    });
};

exports.postReset = async (req, res, next) => {
    try {
        const email = req.body.email;
        const buffer = await randomBytes(32);
        const token = buffer.toString('hex');
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            req.flash('error', 'No user with this email found.');
            return redirect('/reset');
        }
        existingUser.resetToken = token;
        existingUser.resetTokenExpiration = Date.now() + 3600000;
        await existingUser.save();
        res.redirect('/');
        await mailer.sendMail({
            to: [email],
            from: 'andr.karanko@gmail.com',
            subject: 'Password reset!',
            html: `<p>You requested password reset</p>
            <p>Click this link <a href="http://localhost:3000/reset/${token}"></a> 
            to set a new password.</p>`
        });
    } catch (err) {
        console.log(err);
        return res.redirect('/reset');
    }
};
