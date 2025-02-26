// authMiddleware.js
const isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

const isLeader = (req, res, next) => {
  if (req.session.passport.user.isLeader == 1) {
    next();
  } else {
    res.redirect('/dashboard');
  }
};

const isAdmin = (req, res, next) => {
  if (req.session.passport.user.isAdmin == 1) {
    next();
  } else {
    res.redirect('/dashboard');
  }
};

module.exports = { isAuth, isLeader, isAdmin };