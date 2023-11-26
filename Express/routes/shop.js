const express = require('express');
const path = require('path');
const rootDir = require('../utils/path');
const router = express.Router();

const adminData = require('./admin');

router.get('/', (req, res, next) => {
    res.render('shop', { 
        prods: adminData.products, 
        pageTitle: 'Shop', 
        path: '/', 
        // hasProducts: adminData.products.length > 0,
        // activeShop: true,
        // productCSS: true
    });
});

module.exports = router;