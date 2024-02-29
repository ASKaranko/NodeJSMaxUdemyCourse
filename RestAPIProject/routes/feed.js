const express = require('express');
const feedController = require('../controllers/feed');
const { body } = require('express-validator');

const router = express.Router();

router.get('/posts', feedController.getPosts);
router.get('/post/:postId', feedController.getPost);
router.post(
    '/post',
    body('title').trim().isString().isLength({ min: 5 }),
    body('content').trim().isString().isLength({ min: 5 }),
    feedController.createPost
);
router.put(
    '/post/:postId',
    body('title').trim().isString().isLength({ min: 5 }),
    body('content').trim().isString().isLength({ min: 5 }),
    feedController.updatePost
);
router.delete(
    '/post/:postId',
    feedController.deletePost
);

module.exports = router;
