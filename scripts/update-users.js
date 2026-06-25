#!/usr/bin/env node
/**
 * Update default user emails/passwords without wiping the database.
 * Run: node scripts/update-users.js
 */

require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/newsdb';

const USERS = [
  { name: 'Admin User', username: 'admin', email: 'admin@cgfile.in', password: 'Cgfile@Admin9xK2mL7p', role: 'admin', bio: 'Platform administrator' },
  { name: 'Amit', username: 'amit', email: 'amit@cgfile.in', password: 'Cgfile@Amit8nR4wQ3v', role: 'author', bio: 'News author and correspondent' },
  { name: 'Editor', username: 'editor', email: 'editor@cgfile.in', password: 'Cgfile@Edit6tY5zP2j', role: 'editor', bio: 'Platform editor' },
];

const userSchema = new mongoose.Schema({
  name: String, username: String, email: String, password: String,
  role: String, bio: String, isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function updateUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const user of USERS) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      const result = await User.findOneAndUpdate(
        { role: user.role },
        {
          $set: {
            name: user.name,
            username: user.username,
            email: user.email,
            password: hashedPassword,
            bio: user.bio,
            isActive: true,
            isVerified: true,
          },
        },
        { upsert: true, returnDocument: 'after' }
      );
      console.log(`✅ Updated ${user.role}: ${result.email}`);
    }

    await User.deleteMany({
      email: { $nin: USERS.map((u) => u.email) },
      role: { $in: ['admin', 'author', 'editor'] },
    });

    console.log('\nAccounts ready:');
    USERS.forEach((u) => console.log(`  ${u.role}: ${u.email}`));
  } catch (err) {
    console.error('❌ Update failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

updateUsers();
