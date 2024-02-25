const express = require('express');
const bodyParser = require('body-parser');
const feedRoutes = require('./routes/feed');

const app = express();
const { connect, url: uri } = require('./util/database');

//app.use(bodyParser.urlencoded());
app.use(bodyParser.json()); // application/json requests
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

const createMondoDBconnection = async () => {
    await connect();
    app.listen(process.env.PORT);
};
createMondoDBconnection();