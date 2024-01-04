const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;
    const product = new Product(title, price, description, imageUrl, null, req.user._id);
    product
        .save()
        .then((result) => {
            console.log('Created Product :', result);
            res.redirect('/admin/products');
        })
        .catch((err) => console.log(err));
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
                product: product
            });
        })
        .catch((err) => console.log(err));
};

exports.postEditProduct = async (req, res, next) => {
    try {
        const prodId = req.body.productId;
        const updatedTitle = req.body.title;
        const updatedPrice = req.body.price;
        const updatedImage = req.body.imageUrl;
        const updatedDescription = req.body.description;
        await new Product(
            updatedTitle,
            updatedPrice,
            updatedDescription,
            updatedImage,
            prodId
        ).save();
        res.redirect('/admin/products');
    } catch (err) {
        console.log(err);
    }
};

exports.postDeleteProduct = async (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteById(prodId)
        .then((result) => {
            console.log('DESTROYED PRODUCT!');
            res.redirect('/admin/products');
        })
        .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then((products) => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch((err) => console.log(err));
};

// exports.editProduct = (req, res, next) => {
//     Product.fetchAll((products) => {
//         res.render('admin/edit-product', {
//             prods: products,
//             pageTitle: 'Edit Product',
//             path: 'admin/edit-product'
//         });
//     });
// };
