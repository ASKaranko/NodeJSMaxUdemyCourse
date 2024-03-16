const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { connect: dbConnect, url: uri } = require('./util/database');
const { createHandler } = require('graphql-http/lib/use/express');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');

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

app.use(
    '/graphql',
    createHandler({
        schema: graphqlSchema,
        rootValue: graphqlResolver,
        formatError(err) {
            if (!err.originalError) {
                return err;
            }
            const data = err.originalError.data;
            const message = err.message || 'An error occurred';
            const status = err.originalError.code || 500;
            return {
                message,
                status,
                data
            };
        }
    })
);

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
    app.listen(process.env.PORT);
};
createConnections();
