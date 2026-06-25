#!/usr/bin/env node
/**
 * Migrate article reporter strings to Reporter master records.
 * Run: node scripts/migrate-reporters.js
 */

require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/newsdb';

const reporterSchema = new mongoose.Schema({
  name: String,
  slug: String,
  locations: [String],
  defaultLocation: String,
  bio: String,
  isActive: { type: Boolean, default: true },
  order: Number,
}, { timestamps: true });

const articleSchema = new mongoose.Schema({
  reporter: mongoose.Schema.Types.Mixed,
  location: String,
}, { strict: false });

const Reporter = mongoose.models.Reporter || mongoose.model('Reporter', reporterSchema);
const Article = mongoose.models.Article || mongoose.model('Article', articleSchema);

const DEFAULT_REPORTERS = [
  { name: 'अमित श्रीवास्तव', defaultLocation: 'मनेन्द्रगढ़', order: 1 },
  { name: 'सुरेन्द्र मिनोचा', defaultLocation: 'चरचा', order: 2 },
];

async function migrate() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  for (const r of DEFAULT_REPORTERS) {
    const exists = await Reporter.findOne({ name: r.name });
    if (!exists) {
      await Reporter.create(r);
      console.log(`Created reporter: ${r.name}`);
    }
  }

  const articles = await Article.find({}).lean();
  let updated = 0;

  for (const article of articles) {
    const reporterVal = article.reporter;
    if (!reporterVal) continue;

    if (mongoose.Types.ObjectId.isValid(String(reporterVal)) && String(reporterVal).length === 24) {
      continue;
    }

    if (typeof reporterVal === 'string' && reporterVal.trim()) {
      let reporter = await Reporter.findOne({ name: reporterVal.trim() });
      if (!reporter) {
        reporter = await Reporter.create({
          name: reporterVal.trim(),
          defaultLocation: article.location || '',
          order: 99,
        });
        console.log(`Created reporter from article: ${reporterVal}`);
      }

      await Article.updateOne({ _id: article._id }, { $set: { reporter: reporter._id } });
      updated++;
      console.log(`Linked article ${article._id} → ${reporter.name}`);
    }
  }

  console.log(`Done. Updated ${updated} article(s).`);

  const reporters = await Reporter.find({});
  for (const reporter of reporters) {
    if (reporter.defaultLocation && (!reporter.locations || reporter.locations.length === 0)) {
      await Reporter.updateOne(
        { _id: reporter._id },
        { $set: { locations: [reporter.defaultLocation] } }
      );
      console.log(`Migrated locations for: ${reporter.name}`);
    }
  }

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
