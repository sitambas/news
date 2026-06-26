import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 50 },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, maxlength: 500, default: '' },
    color: { type: String, default: '#3B82F6' },
    icon: { type: String, default: 'FiGrid' },
    image: { type: String, default: '' },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    meta: {
      title: String,
      description: String,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

categorySchema.virtual('articleCount', {
  ref: 'Article',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

categorySchema.pre('save', function () {
  if (!this.isNew && this.slug) return;
  if (!this.slug) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    if (!baseSlug) return;
    this.slug = baseSlug;
  }
});

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
