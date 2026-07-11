import mongoose from 'mongoose';
import slugify from 'slugify';

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, unique: true, lowercase: true },
    location: { type: String, default: '', trim: true, maxlength: 100 },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'Reporter', default: null },
    excerpt: { type: String, maxlength: 2000, default: '' },
    content: { type: String, required: true },
    coverImage: { type: String, default: '' },
    coverImageAlt: { type: String, default: '' },
    coverImages: { type: [String], default: [] },
    youtubeUrl: { type: String, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled', 'archived'],
      default: 'draft',
    },
    publishedAt: { type: Date },
    scheduledAt: { type: Date },
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    readingTime: { type: Number, default: 0 },
    isBreaking: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    allowComments: { type: Boolean, default: true },
    meta: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      keywords: [String],
    },
    language: { type: String, default: 'en' },
    aiSummary: { type: String, default: '' },
    relatedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    translations: {
      type: Map,
      of: new mongoose.Schema({
        title: String,
        excerpt: String,
        content: String,
      }),
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

articleSchema.virtual('likeCount').get(function () {
  return this.likes?.length || 0;
});

articleSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'article',
  count: true,
});

articleSchema.pre('save', async function () {
  if (!this.slug || (this.isModified('title') && !this.slug)) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    if (!baseSlug) {
      baseSlug = `article-${this._id || Date.now()}`;
    }
    let slug = baseSlug;
    let count = 0;
    while (await mongoose.models.Article.findOne({ slug, _id: { $ne: this._id } })) {
      count++;
      slug = `${baseSlug}-${count}`;
    }
    this.slug = slug;
  }

  if (this.isModified('content')) {
    const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / 200);
  }

  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Keep coverImage (cards/OG) in sync with first gallery image
  const images = Array.isArray(this.coverImages)
    ? this.coverImages.filter((u) => typeof u === 'string' && u.trim())
    : [];
  if (this.coverImage && !images.includes(this.coverImage)) {
    images.unshift(this.coverImage);
  }
  this.coverImages = [...new Set(images)].slice(0, 10);
  this.coverImage = this.coverImages[0] || this.coverImage || '';
});

articleSchema.index({ slug: 1 });
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ author: 1, status: 1 });
articleSchema.index({ reporter: 1, status: 1 });
articleSchema.index({ views: -1 });
articleSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });

export default mongoose.models.Article || mongoose.model('Article', articleSchema);
