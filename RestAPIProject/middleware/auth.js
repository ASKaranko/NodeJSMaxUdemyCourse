const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    if (!req.get('Authorization')) {
        req.isAuth = false;
        return next();
    }
    let decodedToken;
    const token = req.get('Authorization').split(' ')[1];
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
    } catch (error) {
        req.isAuth = false;
        return next();
    }
    if (!decodedToken) {
        req.isAuth = false;
        return next();
    }
    req.userId = decodedToken.userId;
    req.isAuth = true;
    next();
};