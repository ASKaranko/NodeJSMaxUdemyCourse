exports.getLogin = async (req, res, next) => {
    const loggedIn = req.get('Cookie').trim().split('=')[1] === 'true';
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: loggedIn
    });
};

exports.postLogin = async (req, res, next) => {
    res.cookie('loggedIn', 'true').redirect('/');
};
