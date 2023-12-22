const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
    Product.findAll()
        .then((products) => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products'
            });
        })
        .catch((err) => console.log(err));
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findByPk(prodId)
        .then((product) => {
            res.render('shop/product-detail', {
                product,
                pageTitle: product.title,
                path: '/products'
            });
        })
        .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
    Product.findAll()
        .then((products) => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/'
            });
        })
        .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
    req.user
        .getCart()
        .then((cart) => {
            return cart
                .getProducts()
                .then((products) => {
                    res.render('shop/cart', {
                        pageTitle: 'Your Cart',
                        path: '/cart',
                        products
                    });
                })
                .catch((err) => console.log(err));
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.postCart = async (req, res, next) => {
    const prodId = req.body.productId;
    try {
        const cart = await req.user.getCart();
        const products = await cart.getProducts({ where: { id: prodId } });
        let product;
        if (products?.length > 0) {
            product = products[0];
        }
        let newQuantity = 1;
        if (product) {
            const oldQuantity = product.cartItem.quantity;
            newQuantity = oldQuantity + 1;
        } else {
            product = await Product.findByPk(prodId);
        }
        await cart.addProduct(product, { through: { quantity: newQuantity } });
        res.redirect('/cart');
    } catch (err) {
        console.log(err);
    }
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId, (product) => {
        Cart.deleteProduct(prodId, product.price);
        res.redirect('/cart');
    });
};

exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders'
    });
};

exports.getCheckout = (req, res, next) => {
    res.render('/shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout'
    });
};
