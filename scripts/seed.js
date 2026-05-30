#!/usr/bin/env node
/**
 * Database Seed Script
 * Run: node scripts/seed.js
 */

require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/newsdb';

// Inline schemas for seeding
const categorySchema = new mongoose.Schema({
  name: String, slug: String, description: String,
  color: String, icon: String, isActive: { type: Boolean, default: true }, order: Number,
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: String, username: String, email: String, password: String,
  role: { type: String, default: 'user' }, bio: String,
  isActive: { type: Boolean, default: true }, isVerified: { type: Boolean, default: true },
}, { timestamps: true });

const articleSchema = new mongoose.Schema({
  title: String, slug: String, excerpt: String, content: String,
  coverImage: String, author: mongoose.Schema.Types.ObjectId,
  category: mongoose.Schema.Types.ObjectId, tags: [String],
  status: { type: String, default: 'published' },
  publishedAt: Date, views: { type: Number, default: 0 },
  readingTime: { type: Number, default: 3 },
  isBreaking: Boolean, isFeatured: Boolean, isTrending: Boolean,
  allowComments: { type: Boolean, default: true },
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Article = mongoose.models.Article || mongoose.model('Article', articleSchema);

const bcrypt = require('bcryptjs');
const slugify = (text) => text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');

const CATEGORIES = [
  { name: 'Politics', color: '#EF4444', icon: '🏛️', description: 'Political news and analysis', order: 1 },
  { name: 'Technology', color: '#3B82F6', icon: '💻', description: 'Tech news and innovations', order: 2 },
  { name: 'Business', color: '#10B981', icon: '📈', description: 'Business and finance news', order: 3 },
  { name: 'Science', color: '#8B5CF6', icon: '🔬', description: 'Scientific discoveries', order: 4 },
  { name: 'Sports', color: '#F59E0B', icon: '⚽', description: 'Sports and athletics', order: 5 },
  { name: 'Entertainment', color: '#EC4899', icon: '🎬', description: 'Entertainment and pop culture', order: 6 },
  { name: 'Health', color: '#06B6D4', icon: '❤️', description: 'Health and wellness', order: 7 },
  { name: 'World', color: '#6366F1', icon: '🌍', description: 'International news', order: 8 },
];

const USERS = [
  { name: 'Admin User', username: 'admin', email: 'admin@cgfile.com', password: 'admin123', role: 'admin', bio: 'Platform administrator' },
  { name: 'Sarah Johnson', username: 'sarahjohnson', email: 'sarah@cgfile.com', password: 'author123', role: 'author', bio: 'Senior Environmental Correspondent' },
  { name: 'Mike Chen', username: 'mikechen', email: 'mike@cgfile.com', password: 'editor123', role: 'editor', bio: 'Technology editor and journalist' },
];

const ARTICLES_CONTENT = [];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([Category.deleteMany({}), User.deleteMany({}), Article.deleteMany({})]);
    console.log('🗑️  Cleared existing data');

    // Seed categories
    const categories = await Category.insertMany(
      CATEGORIES.map((c) => ({ ...c, slug: slugify(c.name), isActive: true }))
    );
    console.log(`✅ Created ${categories.length} categories`);

    // Seed users
    const hashedUsers = await Promise.all(
      USERS.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, 12),
      }))
    );
    const users = await User.insertMany(hashedUsers);
    console.log(`✅ Created ${users.length} users`);

    console.log('✅ No dummy articles — clean start!');

    console.log('\n🚀 Seed completed successfully!');
    console.log('\nTest Accounts:');
    console.log('  Admin:  admin@cgfile.com / admin123');
    console.log('  Author: sarah@cgfile.com / author123');
    console.log('  Editor: mike@cgfile.com  / editor123');
  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

seed();
