const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const connectDB = require('../config/db');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const createAdmin = async () => {
  const username = process.env.INITIAL_ADMIN_USERNAME || 'admin';
  const email = process.env.INITIAL_ADMIN_EMAIL || 'admin@legalassist.com';
  const password = process.env.INITIAL_ADMIN_PASSWORD || 'AdminSecurePassword2026!';

  try {
    await connectDB();

    // Check if an admin already exists to prevent duplicate seeding
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log(`An administrator account already exists (${existingAdmin.email}). Seeding skipped.`);
      process.exit(0);
    }

    // Create the admin account
    const admin = await User.create({
      username,
      email,
      password,
      role: 'admin',
      isEmailVerified: true
    });

    console.log('✔ Production Administrator account initialized successfully.');
    console.log(`  Username: ${admin.username}`);
    console.log(`  Email: ${admin.email}`);
    console.log('  Please log in and update your credentials immediately.');
    process.exit(0);
  } catch (error) {
    console.error('✖ Error initializing administrator account:', error.message);
    process.exit(1);
  }
};

createAdmin();
