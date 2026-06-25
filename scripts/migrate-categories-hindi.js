#!/usr/bin/env node
/**
 * Set Hindi names/descriptions on seeded English categories (keeps slugs).
 * Run: node scripts/migrate-categories-hindi.js
 */

require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/newsdb';

const HINDI_CATEGORIES = {
  politics: { name: 'राजनीति', description: 'राजनीतिक समाचार और विश्लेषण', icon: '🏛️', color: '#dc2626' },
  technology: { name: 'तकनीक', description: 'टेक न्यूज़ और नवाचार', icon: '💻', color: '#3B82F6' },
  business: { name: 'व्यापार', description: 'व्यापार और वित्त समाचार', icon: '📈', color: '#10B981' },
  science: { name: 'विज्ञान', description: 'वैज्ञानिक खोजें और शोध', icon: '🔬', color: '#8B5CF6' },
  sports: { name: 'खेल', description: 'खेल समाचार और परिणाम', icon: '⚽', color: '#F59E0B' },
  entertainment: { name: 'मनोरंजन', description: 'मनोरंजन और पॉप संस्कृति', icon: '🎬', color: '#EC4899' },
  health: { name: 'स्वास्थ्य', description: 'स्वास्थ्य और तंदुरुस्ती', icon: '❤️', color: '#06B6D4' },
  world: { name: 'विश्व', description: 'अंतर्राष्ट्रीय समाचार', icon: '🌍', color: '#6366F1' },
};

const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  color: String,
  icon: String,
  order: Number,
  isActive: Boolean,
}, { strict: false });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

async function migrate() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  for (const [slug, hindi] of Object.entries(HINDI_CATEGORIES)) {
    const result = await Category.updateOne(
      { slug },
      { $set: hindi }
    );
    if (result.matchedCount) {
      console.log(`Updated ${slug} → ${hindi.name}`);
    }
  }

  await mongoose.disconnect();
  console.log('Done.');
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
