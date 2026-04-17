require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/admin.model');

async function createAdmin() {
  const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Missing MONGODB_URI, ADMIN_EMAIL, or ADMIN_PASSWORD in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await Admin.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const admin = new Admin({
    email:    ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    name:     'Super Admin',
    role:     'superadmin',
  });

  await admin.save();
  console.log(`Admin created: ${ADMIN_EMAIL}`);
  await mongoose.disconnect();
  process.exit(0);
}

createAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
