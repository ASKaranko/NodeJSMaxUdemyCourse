const { validationResult } = require('express-validator');
const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [
            {
                _id: 1,
                title: 'First Post',
                content: 'This is the first post!',
                imageUrl: 'images/spring.jpg',
                creator: {
                    name: 'Andrei'
                },
                createdAt: new Date()
            }
        ]
    });
};

exports.createPost = async (req, res, next) => {
    try {
        const title = req.body.title;
        const content = req.body.content;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('🚀 ~ errors:', errors);
            return res.status(422).json({
                message:
                    'Validation failed. Please, enter data in correct format',
                errors: errors.array()
            });
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
        console.log('🚀 ~ exports.createPost= ~ error:', error);
    }
};
