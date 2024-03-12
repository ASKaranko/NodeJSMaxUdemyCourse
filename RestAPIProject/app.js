const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { connect: dbConnect, url: uri } = require('./util/database');

//Routes
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

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

//Use routes
app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

// error middleware
app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({
        message,
        data
    });
});

const createConnections = async () => {
    await dbConnect();
    const server = app.listen(process.env.PORT);
    const io = require('./socket').init(server);
    io.on('connection', (socket) => {
        console.log('client is connected to socket.io');
    });
};
createConnections();
