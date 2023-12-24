const Product = require('../models/product');

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

exports.postCartDeleteProduct = async (req, res, next) => {
    const prodId = req.body.productId;
    try {
        const cart = await req.user.getCart();
        const products = await cart.getProducts({ where: { id: prodId } });
        const product = products[0];
        await product.cartItem.destroy();
        res.redirect('/cart');
    } catch (err) {
        console.log(err);
    }
};

exports.postOrder = async (req, res, next) => {
    try {
        const cart = await req.user.getCart();
        const products = await cart.getProducts();
        const order = await req.user.createOrder();
        await order.addProducts(
            products.map((product) => {
                product.orderItem = {
                    quantity: product.cartItem.quantity
                };
                return product;
            })
        );
        await cart.setProducts(null);
        res.redirect('/orders');
    } catch (err) {
        console.log(err);
    }
};

exports.getOrders = async (req, res, next) => {
    try {
        const orders = await req.user.getOrders({
            include: ['products']
        });
        res.render('shop/orders', {
            pageTitle: 'Your Orders',
            path: '/orders',
            orders
        });
    } catch (err) {
        console.log(err);
    }
};

exports.getCheckout = (req, res, next) => {
    res.render('/shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout'
    });
};
