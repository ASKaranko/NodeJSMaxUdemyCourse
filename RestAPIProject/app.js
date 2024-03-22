const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { connect: dbConnect, url: uri } = require('./util/database');
const { createHandler } = require('graphql-http/lib/use/express');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const auth = require('./middleware/auth');
const { unlink } = require('node:fs/promises');
// const cors = require('cors');

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
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(auth);

app.put('/post-image', (req, res, next) => {
    if (!req.isAuth) {
        const error = new Error('Not authenticated!');
        error.statusCode = 401;
        throw error;
    }
    if (!req.file) {
        res.status(200).json({ message: 'Mo image provided!' });
    }
    if (req.body.oldPath) {
        clearImage(req.body.oldPath);
    }
    res.status(201).json({ message: 'File Stored.', filePath: req.file.path.replace('\\', '/') });
});

// alternative to set OPTIONS to 200 response
// app.use(cors());

app.use('/graphql', (req, res) =>
    createHandler({
        schema: graphqlSchema,
        rootValue: {
            createUser: (args) => graphqlResolver.createUser(args, req),
            login: (args) => graphqlResolver.login(args, req),
            createPost: (args) => graphqlResolver.createPost(args, req),
            posts: (args) => graphqlResolver.getPosts(args, req)
        },
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
    })(req, res)
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

const clearImage = async (filePath) => {
    try {
        filePath = path.join(__dirname, '..', filePath);
        await unlink(filePath);
    } catch (error) {
        console.log('🚀 ~ clearImage ~ error:', error);
    }
};
