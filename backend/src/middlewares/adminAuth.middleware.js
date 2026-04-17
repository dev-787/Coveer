const jwt = require('jsonwebtoken');

module.exports = function adminAuth(req, res, next) {
  const token = req.cookies?.adminToken;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    req.admin = {
      _id:   payload._id,
      email: payload.email,
      name:  payload.name,
      role:  payload.role,
    };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
