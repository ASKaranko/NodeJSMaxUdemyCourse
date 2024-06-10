import { expect } from 'chai';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sinon = require('sinon');
const User = require('../models/user');
const AuthController = require('../controllers/auth');
const mongoose = require('mongoose');

describe('Auth controller - login process', function () {
    // variant 1 - stubbing database response
    it('should throw an error with code 500 if accessing the database fails', function (done) {
        sinon.stub(User, 'findOne');
        User.findOne.throws();
        const req = {
            body: {
                email: 'test@tes.com',
                password: 'tester'
            }
        };
        AuthController.login(req, {}, () => {}).then((result) => {
            expect(result).to.be.an('error');
            expect(result).to.have.property('statusCode', 500);
            done();
        });

        User.findOne.restore();
    });

    // variant 2 - make an actual database request
    it('should send a response with valid user status for an existing user', function (done) {
        const url = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}.mongodb.net/test-messages?retryWrites=true&w=majority`;

        mongoose
            .connect(url)
            .then((result) => {
                const user = new User({
                    name: 'test',
                    email: 'test@test.com',
                    password: 'tester',
                    posts: []
                });
                return user.save();
            })
            .then(() => {

            })
            .catch((err) => {
                console.dir(err);
            });
    });
});
