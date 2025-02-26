const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { connection, sessionStore } = require('./db');
const bcrypt = require('bcryptjs');
const { compileScript } = require('vue/compiler-sfc');

passport.use(new LocalStrategy(
  (username, password, done) => {
    connection.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
      if (err) return done(err);
      if (results.length === 0) return done(null, false, { message: 'Incorrect username.' });
      const user = results[0];
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) return done(err);
        if (isMatch) {
          checkStatus(user, done);
        } else {
          return done(null, false, { message: 'Incorrect password.' });
        }
      });
    });
  }
));


// Configure Passport Google Strategy
passport.use(new GoogleStrategy({
  clientID: "34913602610-kgqjg92fjhqoa7nld055m1ffs9313g0j.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: 'http://localhost:8080/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  const { id, displayName, name, emails } = profile;
  const email = emails[0].value;
  const first_name = name.givenName;
  const last_name = name.familyName;

  connection.query('SELECT * FROM users WHERE username = ?', [id], (err, results) => {
    if (err) return done(err);
    if (results.length === 0) {
      const newUser = {
        username: id,
        password: '',
        display_name: displayName,
        first_name,
        last_name,
        email,
        account_type: 'google',
      };
      connection.query('INSERT INTO users SET ?', newUser, (err, res) => {
        if (err) return done(err);
        connection.query('SELECT * FROM users WHERE username = ?', [id], (err, results) => {
          if (err) return done(err);
          checkStatus(results[0], done);

        });
      });
    } else {
      checkStatus(results[0], done);
    }
  });
}));

// Function to check admin status
function checkStatus(user, done) {
  connection.query('SELECT * FROM admins WHERE user_id = ?', [user.id], (err, results) => {
    if (err) return done(err);
    user.isAdmin = results.length > 0;

    connection.query('SELECT * FROM organisations WHERE user_id = ?', [user.id], (err, results) => {
      if (err) return done(err);
      user.isLeader = results.length > 0;
      return done(null, user);
    });
  });
}


// Serialize and deserialize user for session management
passport.serializeUser((user, done) => {
  // Only serialize the fields that you need, excluding the password
  const { id, username, display_name, first_name, last_name, email, isAdmin, isLeader, account_type } = user;
  done(null, { id, username, display_name, first_name, last_name, email, isAdmin, isLeader, account_type });
});

passport.deserializeUser((serializedUser, done) => {
  // Fetch user details from the database if necessary
  connection.query('SELECT * FROM users WHERE id = ?', [serializedUser.id], (err, results) => {
    if (err) return done(err);
    if (results.length === 0) return done(new Error('User not found'));

    const user = results[0];
    // Add isAdmin and isLeader from the serializedUser
    user.isAdmin = serializedUser.isAdmin;
    user.isLeader = serializedUser.isLeader;

    // Exclude the password
    const { password, ...userWithoutPassword } = user;
    done(null, userWithoutPassword);
  });
});