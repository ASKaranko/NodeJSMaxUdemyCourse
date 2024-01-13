const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
    Product.find()
        .then((products) => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products',
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch((err) => console.log(err));
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((product) => {
            res.render('shop/product-detail', {
                product,
                pageTitle: product.title,
                path: '/products',
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
    Product.find()
        .then((products) => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch((err) => console.log(err));
};

exports.getCart = async (req, res, next) => {
    const user = await req.user.populate('cart.items.productId');
    const products = user.cart.items;
    res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        products,
        isAuthenticated: req.session.isLoggedIn
    });
};

exports.postCart = async (req, res, next) => {
    const prodId = req.body.productId;
    try {
        const product = await Product.findById(prodId);
        await req.user.addToCart(product);
        res.redirect('/cart');
    } catch (err) {
        console.log(err);
    }
};

exports.postCartDeleteProduct = async (req, res, next) => {
    const prodId = req.body.productId;
    try {
        await req.user.deleteFromCart(prodId);
        res.redirect('/cart');
    } catch (err) {
        console.log(err);
    }
};

exports.postOrder = async (req, res, next) => {
    try {
        const user = await req.user.populate('cart.items.productId');
        const products = user.cart.items.map((cp) => {
            return {
                product: { ...cp.productId._doc }, // not all members on object, but doc only
                quantity: cp.quantity
            };
        });
        const order = new Order({
            user: {
                name: user.name,
                userId: user // mongoose will pick only id
            },
            products
        });
        await order.save();
        await user.clearCart();
        res.redirect('/orders');
    } catch (err) {
        console.log(err);
    }
};

exports.getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ 'user.userId': req.user._id });
        res.render('shop/orders', {
            pageTitle: 'Your Orders',
            path: '/orders',
            orders,
            isAuthenticated: req.session.isLoggedIn
        });
    } catch (err) {
        console.log(err);
    }
};

exports.getCheckout = (req, res, next) => {
    res.render('/shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout',
        isAuthenticated: req.session.isLoggedIn
    });
};
