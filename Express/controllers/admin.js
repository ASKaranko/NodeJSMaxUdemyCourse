const Product = require('../models/product');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('🚀 ~ exports.postAddProduct= ~ errors:', errors);
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            product: { title, price, description, imageUrl },
            hasError: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    const product = new Product({
        title,
        price,
        description,
        imageUrl,
        userId: req.user // mongoose will pick only id
    });

    product
        .save()
        .then((result) => {
            console.log('Created Product :', result);
            res.redirect('/admin/products');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (editMode === 'false' || !editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((product) => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product,
                hasError: false,
                errorMessage: null,
                validationErrors: []
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postEditProduct = async (req, res, next) => {
    try {
        const prodId = req.body.productId;
        const updatedTitle = req.body.title;
        const updatedPrice = req.body.price;
        const updatedImage = req.body.imageUrl;
        const updatedDescription = req.body.description;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('🚀 ~ exports.postEditProduct= ~ errors:', errors);
            return res.status(422).render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product/',
                editing: true,
                product: {
                    _id: prodId,
                    title: updatedTitle,
                    price: updatedPrice,
                    description: updatedDescription,
                    imageUrl: updatedImage
                },
                hasError: true,
                errorMessage: errors.array()[0].msg,
                validationErrors: errors.array()
            });
        }

        const product = await Product.findById(prodId);
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.imageUrl = updatedImage;
        product.description = updatedDescription;
        await product.save();
        res.redirect('/admin/products');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postDeleteProduct = async (req, res, next) => {
    try {
        const prodId = req.body.productId;
        await Product.deleteOne({ _id: prodId, userId: req.user._id });
        console.log('DESTROYED PRODUCT!');
        res.redirect('/admin/products');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getProducts = (req, res, next) => {
    Product.find({ userId: req.user._id })
        // .populate('userId') // will return full user info (left JOIN)
        .then((products) => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
