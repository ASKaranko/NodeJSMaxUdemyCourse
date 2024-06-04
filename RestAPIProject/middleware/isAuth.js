const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    if (!req.get('Authorization')) {
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    }
    let decodedToken;
    const token = req.get('Authorization').split(' ')[1];
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (error) {
        error.statusCode = 500;
        throw error;
    }
    if (!decodedToken) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        throw error;
    }
    req.userId = decodedToken.userId;
    next();
};
