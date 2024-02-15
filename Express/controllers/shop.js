const { createWriteStream } = require('node:fs');
const path = require('path');
const Product = require('../models/product');
const Order = require('../models/order');
const PDFDocument = require('pdfkit');

const ITEMS_PER_PAGE = 2;

exports.getProducts = async (req, res, next) => {
    const page = +req.query.page || 1;
    const totalProducts = await Product.countDocuments();

    Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .then((products) => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE)
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((product) => {
            res.render('shop/product-detail', {
                product,
                pageTitle: product.title,
                path: '/products'
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getIndex = async (req, res, next) => {
    const page = +req.query.page || 1;
    const totalProducts = await Product.countDocuments();

    Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .then((products) => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE)
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getCart = async (req, res, next) => {
    const user = await req.user.populate('cart.items.productId');
    const products = user.cart.items;
    res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        products
    });
};

exports.postCart = async (req, res, next) => {
    const prodId = req.body.productId;
    try {
        const product = await Product.findById(prodId);
        await req.user.addToCart(product);
        res.redirect('/cart');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postCartDeleteProduct = async (req, res, next) => {
    const prodId = req.body.productId;
    try {
        await req.user.deleteFromCart(prodId);
        res.redirect('/cart');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getCheckout = async (req, res, next) => {
    try {
        const user = await req.user.populate('cart.items.productId');
        let total = 0;
        const products = user.cart.items;
        products.forEach((p) => {
            total += p.quantity * p.productId.price;
        });
        res.render('shop/checkout', {
            pageTitle: 'Checkout',
            path: '/checkout',
            products,
            total
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
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
                email: user.email,
                userId: user // mongoose will pick only id
            },
            products
        });
        await order.save();
        await user.clearCart();
        res.redirect('/orders');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ 'user.userId': req.user._id });
        res.render('shop/orders', {
            pageTitle: 'Your Orders',
            path: '/orders',
            orders
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getInvoice = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId);
        if (!order) {
            return next(new Error('No order is found'));
        }
        if (order.user.userId.toString() !== req.user._id.toString()) {
            return next(new Error('Unauthorized to see an invoice'));
        }
        const invoiceName = `invoice-${orderId}.pdf`;
        const invoicePath = path.join('data', 'invoices', invoiceName);

        const doc = new PDFDocument();
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `inline; filename=${invoiceName}`);

        doc.pipe(createWriteStream(invoicePath));
        doc.pipe(res);

        doc.fontSize(27).font('Courier').text('Invoice', {
            align: 'center',
            underline: true
        });
        doc.moveDown();

        let totalPrice = 0;
        order.products.forEach((p) => {
            totalPrice += p.quantity * p.product.price;
            doc.fontSize(14).text(
                `${p.product.title} - ${p.quantity} x $ ${p.product.price}`,
                { align: 'left' }
            );
        });

        doc.moveDown();
        doc.fontSize(20).text(`Total price: $ ${totalPrice}`);
        doc.end();
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};
