import { expect } from 'chai';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const mongoose = require('mongoose');

const User = require('../models/user');
const FeedController = require('../controllers/feed');

describe('Auth controller - login process', function () {
    before(function (done) {
        const url = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}.mongodb.net/${process.env.MONGO_TEST_DATABASE_NAME}?retryWrites=true&w=majority`;

        mongoose
            .connect(url)
            .then((result) => {
                const user = new User({
                    name: 'test',
                    email: 'test@test.com',
                    password: 'tester',
                    posts: [],
                    _id: '665c8751bee30b63d56be922'
                });
                return user.save();
            })
            .then(() => {
                done();
            });
    });

    it('should add a created post to the posts of the creator', function (done) {
        const req = {
            body: {
                title: 'Test Post',
                content: 'Test Post Body'
            },
            file: {
                path: 'abc'
            },
            userId: '665c8751bee30b63d56be922'
        };

        const res = {
            status: function () {
                return this;
            },
            json: function () {}
        };
        FeedController.createPost(req, res, () => {}).then((updatedUser) => {
            expect(updatedUser).to.have.property('posts');
            expect(updatedUser.posts).to.have.length(1);
            done();
        });
    });

    after(function (done) {
        User.deleteMany({})
            .then(() => {
                return mongoose.disconnect();
            })
            .then(() => {
                done();
            });
    });
});
