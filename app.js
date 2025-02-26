const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const { connection, sessionStore } = require('./db');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const organisationRouter = require('./routes/organisation');
const imagesRouter = require('./routes/images');
const authRouter = require('./routes/auth');


const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));

// Session Management
app.use(session({
  store: sessionStore,
  secret: 'super secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 365,
  },
}));

// Initialize Passport and session middleware
app.use(passport.initialize());
app.use(passport.session());

// Define routes
app.get('/check-session', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      sessionExists: true,
      username: req.session.passport.user.username,
      userId: req.session.passport.user.id,
      isLeader: req.session.passport.user.isLeader,
      isAdmin: req.session.passport.user.isAdmin,
      account_type: req.session.passport.user.account_type
    });
  } else {
    res.json({ sessionExists: false });
  }
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/organisation', organisationRouter);
app.use('/images', imagesRouter);

// Add authentication routes
app.use('/auth', authRouter);
require('./passport-config');


module.exports = app;