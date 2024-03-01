const { validationResult } = require('express-validator');
const { unlink } = require('node:fs/promises');
const path = require('path');
const Post = require('../models/post');

const POSTS_PER_PAGE = 2;

exports.getPosts = async (req, res, next) => {
    try {
        const page = req.query.page || 1;
        const totalPosts = await Post.countDocuments();

        const posts = await Post.find()
            .skip((page - 1) * POSTS_PER_PAGE)
            .limit(POSTS_PER_PAGE);

        res.status(200).json({
            message: 'Posts fetched.',
            posts,
            totalItems: totalPosts
        });
    } catch (error) {
        console.log('🚀 ~ exports.getPosts= ~ error:', error);
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
            console.log(errors);
            const error = new Error(
                'Validation failed. Please, enter data in correct format'
            );
            error.statusCode = 422; // custom property
            throw error;
        }

        if (!req.file) {
            const error = new Error('No image provided.');
            error.statusCode = 422;
            throw error;
        }

        const post = await new Post({
            title,
            content,
            imageUrl: req.file.path.replace('\\', '/'),
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

exports.updatePost = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            const error = new Error(
                'Validation failed. Please, enter data in correct format'
            );
            error.statusCode = 422;
            throw error;
        }

        const postId = req.params.postId;
        const title = req.body.title;
        const content = req.body.content;
        let imageUrl = req.body.image;
        if (req.file) {
            imageUrl = req.file.path;
        }
        if (!imageUrl) {
            const error = new Error('No file picked.');
            error.statusCode = 422;
            throw error;
        }

        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error('Could not find a post');
            error.statusCode = 404;
            throw error;
        }

        if (imageUrl !== post.imageUrl) {
            await clearImage(post.imageUrl);
        }

        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
        const updatedPost = await post.save();

        res.status(200).json({
            message: 'Post Updated.',
            post: updatedPost
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.deletePost = async (req, res, next) => {
    try {
        const postId = req.params.postId;

        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error('Could not find a post');
            error.statusCode = 404;
            throw error;
        }
        // TO DO: check logged in user
        await clearImage(post.imageUrl);
        await Post.deleteOne({ _id: postId });
        res.status(200).json({
            message: 'Post Deleted.'
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

const clearImage = async (filePath) => {
    try {
        filePath = path.join(__dirname, '..', filePath);
        await unlink(filePath);
    } catch (error) {
        console.log('🚀 ~ clearImage ~ error:', error);
    }
};
