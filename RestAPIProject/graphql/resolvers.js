const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const { clearImage } = require('../util/file');
const User = require('../models/user');
const Post = require('../models/post');

const POSTS_PER_PAGE = 2;

module.exports = {
    createUser: async function ({ userInput }) {
        const errors = [];
        if (!validator.isEmail(userInput.email)) {
            errors.push({ message: 'Email is invalid' });
        }
        if (
            validator.isEmpty(userInput.password) ||
            !validator.isLength(userInput.password, { min: 5 })
        ) {
            errors.push({ message: 'Password too short' });
        }
        if (errors.length > 0) {
            const error = new Error('Invalid input');
            error.data = errors;
            error.code = 422;
            throw error;
        }
        const existingUser = await User.findOne({ email: userInput.email });
        if (existingUser) {
            throw new Error('User exists already!');
        }
        const name = userInput.name;
        const email = userInput.email;
        const password = userInput.password;
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await new User({
            name,
            email,
            password: hashedPassword
        }).save();
        return {
            ...user._doc,
            _id: user._id.toString()
        };
    },
    login: async function ({ email, password }) {
        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error('User not found');
            error.code = 401;
            throw error;
        }

        const doMatch = await bcrypt.compare(password, user.password);
        if (!doMatch) {
            const error = new Error('Password is incorrect');
            error.code = 401;
            throw error;
        }

        const token = jwt.sign(
            {
                email: user.email,
                userId: user._id.toString()
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );
        return {
            token,
            userId: user._id.toString()
        };
    },
    createPost: async function ({ postInput }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }
        const errors = [];
        if (
            validator.isEmpty(postInput.title) ||
            !validator.isLength(postInput.title, { min: 5 })
        ) {
            errors.push({ message: 'Title is invalid' });
        }
        if (
            validator.isEmpty(postInput.content) ||
            !validator.isLength(postInput.content, { min: 5 })
        ) {
            errors.push({ message: 'Content is invalid' });
        }
        if (errors.length > 0) {
            const error = new Error('Invalid input');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('Invalid user');
            error.code = 401;
            throw error;
        }

        const post = await new Post({
            title: postInput.title,
            content: postInput.content,
            imageUrl: postInput.imageUrl,
            creator: user
        }).save();

        user.posts.push(post);
        await user.save();

        return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        };
    },
    getPosts: async function ({ page }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }

        if (!page) {
            page = 1;
        }

        const totalPosts = await Post.countDocuments();
        const posts = await Post.find()
            .populate('creator')
            .sort({ createdAt: -1 })
            .skip((page - 1) * POSTS_PER_PAGE)
            .limit(POSTS_PER_PAGE);
        return {
            posts: posts?.map((p) => {
                return {
                    ...p._doc,
                    _id: p._id.toString(),
                    createdAt: p.createdAt.toISOString(),
                    updatedAt: p.updatedAt.toISOString()
                };
            }),
            totalPosts
        };
    },
    getPost: async function ({ id }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }

        const post = await Post.findById(id).populate('creator');
        if (!post) {
            const error = new Error('No post found!');
            error.code = 404;
            throw error;
        }
        return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        };
    },
    updatePost: async function ({ id, postInput }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }

        const post = await Post.findById(id).populate('creator');
        if (!post) {
            const error = new Error('No post found!');
            error.code = 404;
            throw error;
        }

        if (post.creator._id.toString() !== req.userId.toString()) {
            const error = new Error('Not authorized!');
            error.code = 403;
            throw error;
        }

        const errors = [];
        if (
            validator.isEmpty(postInput.title) ||
            !validator.isLength(postInput.title, { min: 5 })
        ) {
            errors.push({ message: 'Title is invalid' });
        }
        if (
            validator.isEmpty(postInput.content) ||
            !validator.isLength(postInput.content, { min: 5 })
        ) {
            errors.push({ message: 'Content is invalid' });
        }
        if (errors.length > 0) {
            const error = new Error('Invalid input');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        post.title = postInput.title;
        post.content = postInput.content;
        if (postInput.imageUrl) {
            post.imageUrl = postInput.imageUrl;
        }
        const updatedPost = await post.save();

        return {
            ...updatedPost._doc,
            _id: updatedPost._id.toString(),
            createdAt: updatedPost.createdAt.toISOString(),
            updatedAt: updatedPost.updatedAt.toISOString()
        };
    },
    deletePost: async function ({ id }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }
        const post = await Post.findById(id);
        if (!post) {
            const error = new Error('No post found!');
            error.code = 404;
            throw error;
        }
        if (post.creator.toString() !== req.userId.toString()) {
            const error = new Error('Not authorized!');
            error.code = 403;
            throw error;
        }
        await clearImage(post.imageUrl);
        await post.deleteOne();
        const user = await User.findById(req.userId);
        user.posts.pull(id);
        await user.save();
        return true;
    },
    getUser: async function (args, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('No user found!');
            error.code = 404;
            throw error;
        }
        return {
            ...user._doc,
            _id: user._id.toString()
        };
    },
    updateStatus: async function ({ status }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('No user found!');
            error.code = 404;
            throw error;
        }
        user.status = status;
        await user.save();
        return {
            ...user._doc,
            _id: user._id.toString()
        };
    }
};
