const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoDBStore = require('connect-mongodb-session')(session);
const uid = require('uid-safe');
const csrf = require('csurf');
const flash = require('connect-flash');

const { connect, url: uri } = require('./util/database');
const User = require('./models/user');
const errorController = require('./controllers/error');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const app = express();
const store = new mongoDBStore({
    uri,
    collection: 'sessions'
});
const csrfProtection = csrf({});
app.use(flash());

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({
        genid: function () {
            return uid.sync(18);
        },
        secret: 'tFvsaFfHHK44gU', // cspell:ignore tFvsaFfHHK44gU
        resave: false,
        saveUninitialized: false,
        store
    })
);

app.use(csrfProtection);

app.use(async (req, res, next) => {
    // we need user object from db, bc in session object is serialized
    // and all the methods are gone
    if (req.session?.user?._id) {
        try {
            const user = await User.findById(req.session.user._id);
            if (user) {
                req.user = user;
            }
            next();
        } catch (err) {
            console.log('error inside user request ', err);
        }
    } else {
        next();
    }
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use('/500', errorController.get500);
app.use(errorController.get404);

const createMondoDBconnection = async () => {
    await connect();
    app.listen(3000);
};

createMondoDBconnection();
