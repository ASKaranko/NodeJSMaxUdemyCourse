const express = require('express');
const feedController = require('../controllers/feed');
const { body } = require('express-validator');

const router = express.Router();

router.get('/posts', feedController.getPosts);
router.post(
    '/post',
    body('title').trim().isString().isLength({ min: 5 }),
    body('content').trim().isString().isLength({ min: 5 }),
    feedController.createPost
);

module.exports = router;
