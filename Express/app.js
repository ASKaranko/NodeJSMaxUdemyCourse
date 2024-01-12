const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoDBStore = require('connect-mongodb-session')(session);
const uid = require('uid-safe');

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

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

const createMondoDBconnection = async () => {
    await connect();
    await createUser();
    app.listen(3000);
};

const createUser = async () => {
    if (!(await User.findOne({ name: 'Andrei' }))) {
        return await new User({
            name: 'Andrei',
            email: 'andr.karanko@gmail.com',
            cart: { items: [] }
        }).save();
    }
};

createMondoDBconnection();
