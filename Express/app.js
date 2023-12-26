const express = require('express');
const path = require('path');
const connectToDB = require('./util/database');

const errorController = require('./controllers/error');
// const adminRoutes = require('./routes/admin');
// const shopRoutes = require('./routes/shop');
const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    // User.findByPk(1)
    //     .then((user) => {
    //         req.user = user;
    //         next();
    //     })
    //     .catch((err) => console.log(err));
});

// app.use('/admin', adminRoutes);
// app.use(shopRoutes);
app.use(errorController.get404);

const createMondoDBconnection = async () => {
    const client = await connectToDB();
    console.log('Connected to MondoDB');
    console.log('client', client);
    app.listen(3000);
};

createMondoDBconnection();
