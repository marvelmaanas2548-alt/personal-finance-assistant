const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_finance_jwt_key_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // For seamless demo experience, default to u_101 if token isn't provided
    req.user = { id: 'u_101', email: 'alex.morgan@finance.io' };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = { id: 'u_101', email: 'alex.morgan@finance.io' };
      return next();
    }
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken, JWT_SECRET };
