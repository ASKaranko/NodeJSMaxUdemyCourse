const { validationResult } = require('express-validator');
const Post = require('../models/post');

exports.getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find();
        res.status(200).json({
            message: 'Posts fetched.',
            posts
        });
    } catch (error) {
        console.log("🚀 ~ exports.getPosts= ~ error:", error)
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.getPost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error('Could not find a post');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: 'Post fetched.',
            post
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.createPost = async (req, res, next) => {
    try {
        const title = req.body.title;
        const content = req.body.content;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error(
                'Validation failed. Please, enter data in correct format'
            );
            error.statusCode = 422; // custom property
            throw error;
        }

        const post = await new Post({
            title,
            content,
            imageUrl: 'images/spring.jpg',
            creator: { name: 'Andrei' }
        }).save();

        res.status(201).json({
            message: 'Post created successfully!',
            post
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};
