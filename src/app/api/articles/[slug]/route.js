import connectDB from '@/lib/db';
import Article from '@/models/Article';
import Category from '@/models/Category';
import { getServerUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/apiResponse';
import { isValidYouTubeUrl } from '@/utils/youtube';
import mongoose from 'mongoose';

const HINDI_CATEGORY_MAP = {
  'राजनीति': 'politics',
  'तकनीक': 'technology',
  'व्यापार': 'business',
  'विज्ञान': 'science',
  'खेल': 'sports',
  'मनोरंजन': 'entertainment',
  'स्वास्थ्य': 'health',
  'विश्व': 'world',
};

async function findArticleByIdentifier(identifier) {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return Article.findOne({ _id: identifier });
  }
  return Article.findOne({ slug: identifier });
}

async function resolveReporterId(reporter) {
  if (!reporter) return null;
  if (!mongoose.Types.ObjectId.isValid(reporter)) return null;
  const Reporter = (await import('@/models/Reporter')).default;
  const found = await Reporter.findById(reporter);
  return found ? found._id : null;
}

async function resolveCategoryId(category) {
  if (!category) return null;
  if (mongoose.Types.ObjectId.isValid(category)) return category;

  const resolvedSlug = HINDI_CATEGORY_MAP[category] || category.toLowerCase();
  const cat = await Category.findOne({
    $or: [
      { slug: resolvedSlug },
      { name: { $regex: new RegExp(`^${resolvedSlug}$`, 'i') } },
    ],
  });
  return cat?._id || null;
}

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const adminView = searchParams.get('admin') === '1';
    const user = adminView ? await getServerUser() : null;
    const canEdit = user && ['admin', 'editor', 'author'].includes(user.role);

    const baseQuery = mongoose.Types.ObjectId.isValid(slug)
      ? { _id: slug }
      : { slug };
    const query = { ...baseQuery };
    if (!adminView || !canEdit) {
      query.status = 'published';
    }

    const article = await Article.findOne(query)
      .populate('author', 'name username avatar bio social')
      .populate('category', 'name slug color')
      .populate('reporter', 'name defaultLocation locations slug bio')
      .populate('relatedArticles', 'title slug coverImage publishedAt readingTime')
      .lean();

    if (!article) return errorResponse('Article not found', 404);

    if (!adminView) {
      Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } }).exec();
    }

    return successResponse(article);
  } catch (error) {
    console.error('Article GET error:', error);
    return errorResponse('Failed to fetch article', 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getServerUser();
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { slug } = await params;
    const body = await request.json();

    const article = await findArticleByIdentifier(slug);
    if (!article) return errorResponse('Article not found', 404);

    const isOwner = article.author.toString() === user.id;
    const isAdmin = ['admin', 'editor'].includes(user.role);
    if (!isOwner && !isAdmin) return errorResponse('Forbidden', 403);

    const allowedFields = ['title', 'content', 'excerpt', 'category', 'tags', 'status',
      'coverImage', 'coverImageAlt', 'youtubeUrl', 'location',
      'isBreaking', 'isFeatured', 'isTrending',
      'allowComments', 'meta', 'scheduledAt', 'relatedArticles', 'aiSummary'];

    if (body.youtubeUrl !== undefined && body.youtubeUrl && !isValidYouTubeUrl(body.youtubeUrl)) {
      return errorResponse('Invalid YouTube URL', 400);
    }

    if (body.category !== undefined) {
      const categoryId = await resolveCategoryId(body.category);
      if (!categoryId) return errorResponse(`Category "${body.category}" not found`, 400);
      article.category = categoryId;
    }

    if (body.reporter !== undefined) {
      if (!body.reporter) {
        article.reporter = null;
      } else {
        const reporterId = await resolveReporterId(body.reporter);
        if (!reporterId) return errorResponse('Reporter not found', 400);
        article.reporter = reporterId;
      }
    }

    allowedFields.forEach((field) => {
      if (field === 'category') return;
      if (body[field] === undefined) return;
      if (field === 'excerpt') {
        article.excerpt = String(body.excerpt || '')
          .replace(/[*_#>`]/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 2000);
        return;
      }
      article[field] = body[field];
    });

    await article.save();
    await article.populate('author', 'name username avatar');
    await article.populate('category', 'name slug color');
    await article.populate('reporter', 'name defaultLocation locations slug');

    return successResponse(article, 'Article updated successfully');
  } catch (error) {
    console.error('Article PUT error:', error);
    const msg =
      error?.name === 'ValidationError'
        ? Object.values(error.errors || {})[0]?.message || 'लेख डेटा अमान्य है'
        : 'Failed to update article';
    return errorResponse(msg, 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getServerUser();
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { slug } = await params;

    const article = await findArticleByIdentifier(slug);
    if (!article) return errorResponse('Article not found', 404);

    const isOwner = article.author.toString() === user.id;
    const isAdmin = ['admin', 'editor'].includes(user.role);
    if (!isOwner && !isAdmin) return errorResponse('Forbidden', 403);

    await Article.deleteOne({ _id: article._id });
    return successResponse(null, 'Article deleted successfully');
  } catch (error) {
    console.error('Article DELETE error:', error);
    return errorResponse('Failed to delete article', 500);
  }
}
