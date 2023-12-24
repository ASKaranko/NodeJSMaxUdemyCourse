const express = require('express');
const path = require('path');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const Order = require('./models/order');
const CartItem = require('./models/cart-item');
const OrderItem = require('./models/order-item');

const errorController = require('./controllers/error');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findByPk(1)
        .then((user) => {
            req.user = user;
            next();
        })
        .catch((err) => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

sequelize
    //.sync({ force: true }) //will create a new tables, event if they are already exist
    .sync()
    .then((result) => {
        return User.findByPk(1);
    })
    .then((user) => {
        if (!user) {
            return User.create({
                name: 'Andrei',
                email: 'andr.karanko@gmail.com'
            });
        }
        return user;
    })
    .then(async (user) => {
        const cart = await user.getCart();
        return { user, cart };
    })
    .then(({ user, cart }) => {
        if (!cart) {
            return user.createCart();
        }
        return cart;
    })
    .then((cart) => {
        app.listen(3000);
    })
    .catch((err) => console.log(err));
