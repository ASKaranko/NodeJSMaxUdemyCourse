const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const feedRoutes = require('./routes/feed');

const app = express();
const { connect, url: uri } = require('./util/database');

//app.use(bodyParser.urlencoded());
app.use(bodyParser.json()); // application/json requests
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    );
    next();
});
app.use('/feed', feedRoutes);

// error middleware
app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({
        message
    });
});

const createMondoDBconnection = async () => {
    await connect();
    app.listen(process.env.PORT);
};
createMondoDBconnection();
