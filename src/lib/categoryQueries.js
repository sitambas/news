import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Article from '@/models/Article';
import mongoose from 'mongoose';

export function normalizeCategorySlug(slug) {
  if (!slug) return '';
  try {
    return decodeURIComponent(String(slug)).trim();
  } catch {
    return String(slug).trim();
  }
}

export async function findCategoryBySlug(slug) {
  await connectDB();
  const normalized = normalizeCategorySlug(slug);
  if (!normalized) return null;

  const category = await Category.findOne({
    $or: [
      { slug: normalized },
      { slug: normalized.toLowerCase() },
      { name: normalized },
    ],
  }).lean();

  return category;
}

export async function resolveCategoryId(categoryRef) {
  if (!categoryRef) return null;
  const normalized = normalizeCategorySlug(categoryRef);
  if (mongoose.Types.ObjectId.isValid(normalized)) return normalized;

  const category = await findCategoryBySlug(normalized);
  return category?._id || null;
}

export async function getPublishedArticlesByCategory(categoryRef, { limit = 24, page = 1 } = {}) {
  const categoryId = await resolveCategoryId(categoryRef);
  if (!categoryId) return { articles: [], total: 0 };

  await connectDB();
  const query = { status: 'published', category: categoryId };
  const skip = (page - 1) * limit;
  const [articles, total] = await Promise.all([
    Article.find(query)
      .populate('author', 'name username avatar')
      .populate('category', 'name slug color icon')
      .populate('reporter', 'name defaultLocation locations slug')
      .select('-content -likes -bookmarks')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Article.countDocuments(query),
  ]);

  return { articles, total };
}
