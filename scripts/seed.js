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
  { name: 'Admin User', username: 'admin', email: 'admin@newshub.com', password: 'admin123', role: 'admin', bio: 'Platform administrator' },
  { name: 'Sarah Johnson', username: 'sarahjohnson', email: 'sarah@newshub.com', password: 'author123', role: 'author', bio: 'Senior Environmental Correspondent' },
  { name: 'Mike Chen', username: 'mikechen', email: 'mike@newshub.com', password: 'editor123', role: 'editor', bio: 'Technology editor and journalist' },
];

const ARTICLES_CONTENT = [
  {
    title: 'Global Leaders Reach Historic Climate Agreement at COP30 Summit',
    excerpt: 'World leaders from 195 countries have signed a landmark climate accord pledging net-zero emissions by 2040.',
    content: '<p>In a landmark moment for global diplomacy, world leaders from 195 countries gathered in Geneva for the COP30 Climate Summit and emerged with a historic agreement.</p><h2>Key Provisions</h2><p>The accord commits signatory nations to achieving net-zero carbon emissions by 2040 — a full decade earlier than the targets set in the Paris Agreement.</p><blockquote>"This is not just an agreement on paper. This is a binding commitment backed by real financial mechanisms."</blockquote><p>The deal includes a $2 trillion climate finance fund, a phase-out of coal power by 2035, and mandatory annual emissions reporting.</p>',
    coverImage: 'https://images.unsplash.com/photo-1569163139394-de4e5f43e5ca?w=800',
    tags: ['climate', 'cop30', 'environment', 'world leaders'],
    isBreaking: true, isFeatured: true, views: 12450,
  },
  {
    title: 'Apple Unveils Revolutionary AI-Powered MacBook with 72-Hour Battery Life',
    excerpt: 'The new MacBook features a custom neural processing unit delivering unprecedented performance.',
    content: '<p>Apple has unveiled its most ambitious MacBook yet, featuring a revolutionary AI chip that promises 72-hour battery life and performance that rivals professional workstations.</p><h2>Technical Specifications</h2><p>The new M4 Ultra chip integrates 120 billion transistors and can process 38 trillion operations per second.</p><p>Available in Space Black and Silver, starting at $1,999.</p>',
    coverImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    tags: ['apple', 'macbook', 'ai', 'technology'],
    isTrending: true, views: 8920,
  },
  {
    title: 'Scientists Discover Earth-Like Planet in Habitable Zone Just 12 Light-Years Away',
    excerpt: 'Astronomers using the James Webb Telescope have identified a planet with strong biosignatures.',
    content: '<p>Astronomers have made a groundbreaking discovery: an Earth-like planet orbiting a nearby star within the habitable zone, just 12 light-years from our solar system.</p><h2>Discovery Details</h2><p>The planet, designated Proxima Centauri c-2, has a mass approximately 1.2 times that of Earth and orbits in the habitable zone of its parent star.</p><p>Most excitingly, spectroscopic analysis has revealed the presence of oxygen, water vapor, and methane in the atmosphere.</p>',
    coverImage: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800',
    tags: ['science', 'space', 'exoplanet', 'astronomy'],
    isFeatured: true, views: 15320,
  },
];

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

    // Seed articles
    const techCat = categories.find((c) => c.name === 'Technology');
    const worldCat = categories.find((c) => c.name === 'World');
    const sciCat = categories.find((c) => c.name === 'Science');
    const authorUser = users.find((u) => u.username === 'sarahjohnson');

    const articleData = ARTICLES_CONTENT.map((a, i) => ({
      ...a,
      slug: slugify(a.title),
      author: authorUser._id,
      category: [worldCat, techCat, sciCat][i]._id,
      status: 'published',
      publishedAt: new Date(Date.now() - (i + 1) * 3600000),
      readingTime: Math.ceil(a.content.split(' ').length / 200),
    }));

    const articles = await Article.insertMany(articleData);
    console.log(`✅ Created ${articles.length} articles`);

    console.log('\n🚀 Seed completed successfully!');
    console.log('\nTest Accounts:');
    console.log('  Admin:  admin@newshub.com / admin123');
    console.log('  Author: sarah@newshub.com / author123');
    console.log('  Editor: mike@newshub.com  / editor123');
  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

seed();
