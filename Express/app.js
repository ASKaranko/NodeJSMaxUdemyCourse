const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoDBStore = require('connect-mongodb-session')(session);
const uid = require('uid-safe');
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use(flash());

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage, fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
// static assume images are in root folder
app.use('/images', express.static(path.join(__dirname, 'images')));

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
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

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
            next(new Error(err));
        }
    } else {
        next();
    }
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use('/500', errorController.get500);
app.use(errorController.get404);
app.use((err, req, res, next) => {
    //res.status(error.httpStatusCode).render(...);
    res.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    });
});

const createMondoDBconnection = async () => {
    await connect();
    app.listen(3000);
};

createMondoDBconnection();
