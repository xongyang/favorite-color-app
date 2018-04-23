var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  // redirect to /secret route when homepage is requested
  res.redirect('/secret');
});

/* GET login page */
router.get('/login', function(req, res, next) {
  res.render('login'); // Render login page
});

/* GET signup page */
router.get('/signup', function(req, res, next) {
  res.render('signup'); // Render signup page
});

/* POST to login */
// Use passport authenticate() to authenticate request
router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/secret', // if successful authentication, redirect to /secret route
  failureRedirect: '/login', // if it fails, redirect to /login route
  failureFlash: true // Allow flash messages
}));

/* POST to signup */
// use passport authenticate() to authenticate request
router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/secret', // if successful, redirect to secret route
  failureRedirect: '/signup', // if fails, redirect to signup
  failureFlash: true // Allow flash messages
}));

/* GET secret page */
// Middleware isLoggedIn function is one of the parameters
router.get('/secret', isLoggedIn, function(req, res, next) {

  // Send username, signUpDate, and favorite data to template
  res.render('secret', {
    username: req.user.local.username,
      twitterName: req.user.twitter.displayName,
      signupDate: req.user.signupDate,
      favorites: req.user.favorites
  });
});

/* The isLoggedIn function verifies if user is logged in
and allows user to proceed and will call the next middleware
or the route handler that called the middleware function.
If user is not logged in, redirect to the login page */
function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/login');
  }
}

/* GET logout page */
router.get('/logout', function(req, res, next) {
  // Logout() terminates session and req.user
  req.logout();
  res.redirect('/'); // Redirect to home page
});

/* POST to update secrets */
router.post('/saveSecrets', isLoggedIn, function(req, res, next) {
  // Verify is user is logged in by calling the isLoggedIn function

  // If favorite color or lucky number has been updated
  if (req.body.color || req.body.luckyNumber) {
    // Add the new color and lucky number to the user.favorites object if updated,
    // otherwise keep user's favorite color or lucky number
    req.user.favorites.color = req.body.color || req.user.favorites.color;
    req.user.favorites.luckyNumber = req.body.luckyNumber || req.user.favorites.luckyNumber;

    req.user.save() // Save the user that has been modified and save data to the database
        .then(() => {
          req.flash('updateMsg', "Your data was updated");
          res.redirect('/secret');
        })
        .catch((err) => {
          if(err.name === 'ValidationError') {
            req.flash('updateMsg', 'Your data is not valid');
            res.redirect('/secret');
          } else {
            next(err);
          }
        });
  }

  else {
    req.flash('updateMsg', 'Please enter some data');
    res.redirect('/secret');
  }

});

/* GET Twitter authentication. Redirect user to
Twitter by calling passport's authenticate method */
router.get('/auth/twitter', passport.authenticate('twitter'));

/* GET to handle the response from Twitter. When the user has
authenticated, Twitter requests to this route */
router.get('/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/secret',
  failureRedirect: '/'
}));

module.exports = router;
