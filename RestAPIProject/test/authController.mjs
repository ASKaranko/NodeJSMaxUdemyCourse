import { expect } from 'chai';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sinon = require('sinon');
const User = require('../models/user');
const AuthController = require('../controllers/auth');
const mongoose = require('mongoose');

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

    beforeEach(function () {});
    afterEach(function () {});

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
        const req = { userId: '665c8751bee30b63d56be922' };
        const res = {
            statusCode: 500,
            userStatus: null,
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.userStatus = data.status;
            }
        };
        AuthController.getStatus(req, res, () => {}).then(() => {
            expect(res.statusCode).to.be.equal(200);
            expect(res.userStatus).to.be.equal('I am new!');
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
