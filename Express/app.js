const express = require('express');
const path = require('path');
const { connect } = require('./util/database');
const User = require('./models/user');

const errorController = require('./controllers/error');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {
    try {
        const user = await User.findOne({name: 'Andrei'});
        req.user = user;
    } catch (err) {
        console.log(err);
    }
    next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

const createMondoDBconnection = async () => {
    await connect();
    await createUser();
    app.listen(3000);
};

const createUser = async () => {
    if (!(await User.findOne({name: 'Andrei'}))) {
        return await new User({
            name: 'Andrei',
            email: 'andr.karanko@gmail.com',
            cart: { items: [] }
        }).save();
    }
};

createMondoDBconnection();
