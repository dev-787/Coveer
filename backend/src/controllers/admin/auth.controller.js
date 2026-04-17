const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const Admin  = require('../../models/admin.model');

const COOKIE_NAME = 'adminToken';

function cookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure:   isProd,
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = jwt.sign(
      { _id: admin._id, email: admin.email, name: admin.name, role: admin.role },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie(COOKIE_NAME, token, cookieOptions());
    return res.json({ name: admin.name, email: admin.email, role: admin.role });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions());
  return res.json({ message: 'Logged out' });
};

exports.me = (req, res) => {
  return res.json(req.admin);
};
