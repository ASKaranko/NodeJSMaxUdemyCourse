import { createRequire } from 'node:module';
import { expect } from 'chai';

const require = createRequire(import.meta.url);
const isAuth = require('../middleware/isAuth');
const jwt = require('jsonwebtoken');
const sinon = require('sinon'); // creates mocks

describe('Auth middleware', function () {
    it('should throw an error if no authorization header is present', function () {
        const req = {
            get: function (headerName) {
                return null;
            }
        };
        expect(isAuth.bind(this, req, {}, () => {})).to.throw(
            'Not authenticated'
        );
    });

    it('should throw an error if no authorization header is only one string', function () {
        const req = {
            get: function (headerName) {
                return 'xyz';
            }
        };
        expect(isAuth.bind(this, req, {}, () => {})).to.throw();
    });

    it('should throw an error if the token cannot be verified', function () {
        const req = {
            get: function (headerName) {
                return 'Bearer xyz';
            }
        };
        expect(isAuth.bind(this, req, {}, () => {})).to.throw();
    });

    it('should should yield a userId after decoding the token', function () {
        const req = {
            get: function (headerName) {
                return 'Bearer xcxfdsdfdsfsdyz';
            }
        };
        sinon.stub(jwt, 'verify'); //jwt method verify is transformed to stub/mock
        jwt.verify.returns({
            userId: 'abc'
        });
        isAuth(req, {}, () => {});
        expect(req).to.haveOwnProperty('userId');
        expect(req).to.have.property('userId', 'abc');
        expect(jwt.verify.called).to.be.true;
        jwt.verify.restore();
    });
});
