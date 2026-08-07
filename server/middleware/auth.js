// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, error: 'Not authenticated. Please login with Discord.' });
}

function isAuthenticatedPage(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // Redirect to home/login page
  res.redirect('/');
}

module.exports = { isAuthenticated, isAuthenticatedPage };
