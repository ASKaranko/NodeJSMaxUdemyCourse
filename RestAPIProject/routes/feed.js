const express = require('express');
const { body } = require('express-validator');
const feedController = require('../controllers/feed');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

router.get('/posts', isAuth, feedController.getPosts);
router.get('/post/:postId', isAuth, feedController.getPost);
router.post(
    '/post',
    isAuth,
    body('title').trim().isString().isLength({ min: 5 }),
    body('content').trim().isString().isLength({ min: 5 }),
    feedController.createPost
);
router.put(
    '/post/:postId',
    isAuth,
    body('title').trim().isString().isLength({ min: 5 }),
    body('content').trim().isString().isLength({ min: 5 }),
    feedController.updatePost
);
router.delete('/post/:postId', isAuth, feedController.deletePost);

module.exports = router;
