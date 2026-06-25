import connectDB from '@/lib/db';
import Article from '@/models/Article';
import { getServerUser } from '@/lib/auth';
import { errorResponse, paginatedResponse, successResponse } from '@/utils/apiResponse';
import { isValidYouTubeUrl } from '@/utils/youtube';
import mongoose from 'mongoose';

async function resolveReporterId(reporter) {
  if (!reporter) return null;
  if (!mongoose.Types.ObjectId.isValid(reporter)) {
    return null;
  }
  const Reporter = (await import('@/models/Reporter')).default;
  const found = await Reporter.findById(reporter);
  return found ? found._id : null;
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const author = searchParams.get('author');
    const reporter = searchParams.get('reporter');
    let status = searchParams.get('status') || 'published';
    const featured = searchParams.get('featured');
    const breaking = searchParams.get('breaking');
    const trending = searchParams.get('trending');
    const sort = searchParams.get('sort') || '-publishedAt';

    if (status === 'all') {
      const user = await getServerUser();
      if (!user || !['admin', 'editor', 'author'].includes(user.role)) {
        status = 'published';
      }
    }

    const query = {};
    if (status !== 'all') query.status = status;
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (author) query.author = author;
    if (reporter) query.reporter = reporter;
    if (featured === 'true') query.isFeatured = true;
    if (breaking === 'true') query.isBreaking = true;
    if (trending === 'true') query.isTrending = true;

    const skip = (page - 1) * limit;
    const total = await Article.countDocuments(query);

    const articles = await Article.find(query)
      .populate('author', 'name username avatar')
      .populate('category', 'name slug color')
      .populate('reporter', 'name defaultLocation locations slug')
      .select('-content -likes -bookmarks')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return paginatedResponse(articles, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    });
  } catch (error) {
    console.error('Articles GET error:', error);
    return errorResponse('Failed to fetch articles', 500);
  }
}

export async function POST(request) {
  try {
    const user = await getServerUser();
    if (!user) return errorResponse('Unauthorized', 401);
    if (!['admin', 'editor', 'author'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }

    await connectDB();
    const body = await request.json();
    const { title, content, excerpt, category, tags, status, coverImage, coverImageAlt, youtubeUrl,
      location, reporter,
      isBreaking, isFeatured, isTrending, allowComments, meta, scheduledAt } = body;

    if (!title || !content || !category) {
      return errorResponse('Title, content, and category are required', 400);
    }

    if (youtubeUrl && !isValidYouTubeUrl(youtubeUrl)) {
      return errorResponse('Invalid YouTube URL', 400);
    }

    // Resolve category: accept MongoDB ID, English slug, Hindi name, or English name
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
    let categoryId = category;
    if (!mongoose.Types.ObjectId.isValid(category)) {
      const Category = (await import('@/models/Category')).default;
      const resolvedSlug = HINDI_CATEGORY_MAP[category] || category.toLowerCase();
      const cat = await Category.findOne({
        $or: [
          { slug: resolvedSlug },
          { name: { $regex: new RegExp(`^${resolvedSlug}$`, 'i') } },
        ],
      });
      if (!cat) return errorResponse(`Category "${category}" not found`, 400);
      categoryId = cat._id;
    }

    let reporterId = null;
    if (reporter) {
      reporterId = await resolveReporterId(reporter);
      if (!reporterId) return errorResponse('Reporter not found', 400);
    }

    const article = await Article.create({
      title, content, excerpt, category: categoryId, tags: tags || [],
      status: status || 'draft', coverImage, coverImageAlt, youtubeUrl: youtubeUrl || '',
      location: location || '', reporter: reporterId,
      isBreaking: isBreaking || false, isFeatured: isFeatured || false,
      isTrending: isTrending || false, allowComments: allowComments !== false,
      meta: meta || {}, scheduledAt, author: user.id,
    });

    await article.populate('author', 'name username avatar');
    await article.populate('category', 'name slug color');
    await article.populate('reporter', 'name defaultLocation locations slug');

    return successResponse(article, 'Article created successfully', 201);
  } catch (error) {
    console.error('Articles POST error:', error);
    return errorResponse('Failed to create article', 500);
  }
}
