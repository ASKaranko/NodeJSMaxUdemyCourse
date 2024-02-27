const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const feedRoutes = require('./routes/feed');

const { v4: uuidv4 } = require('uuid');

const app = express();
const { connect, url: uri } = require('./util/database');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true); // null - no errors
    } else {
        cb(null, false);
    }
};

//app.use(bodyParser.urlencoded());
app.use(bodyParser.json()); // application/json requests
app.use(multer({ storage, fileFilter }).single('image')); // parse image param in incoming request
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
