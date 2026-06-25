import mongoose from 'mongoose';
import slugify from 'slugify';

const reporterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
    slug: { type: String, unique: true, lowercase: true },
    locations: [{ type: String, trim: true, maxlength: 100 }],
    defaultLocation: { type: String, default: '', trim: true, maxlength: 100 },
    bio: { type: String, maxlength: 300, default: '' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

reporterSchema.virtual('articleCount', {
  ref: 'Article',
  localField: '_id',
  foreignField: 'reporter',
  count: true,
});

reporterSchema.pre('save', function () {
  if (this.defaultLocation && (!this.locations || this.locations.length === 0)) {
    this.locations = [this.defaultLocation];
  }
  if (this.locations?.length) {
    this.defaultLocation = this.locations[0];
  }

  if (this.isModified('name')) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    if (!baseSlug) {
      baseSlug = `reporter-${this._id || Date.now()}`;
    }
    this.slug = baseSlug;
  }
});

reporterSchema.index({ isActive: 1, order: 1 });

export default mongoose.models.Reporter || mongoose.model('Reporter', reporterSchema);
