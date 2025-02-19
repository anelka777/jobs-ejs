module.exports = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You need to log in');
        return res.redirect('/logon');
    }
    next();
};
