const express = require('express');
const router = express.Router();

const rootData = require('./root');

router.get('/users', (req, res, next) => {
    res.render('users', { 
        users: rootData.users, 
        pageTitle: 'Users', 
        path: '/users',
    });
});

module.exports = router;