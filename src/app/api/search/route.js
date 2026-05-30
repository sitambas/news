import connectDB from '@/lib/db';
import Article from '@/models/Article';
import { errorResponse, paginatedResponse } from '@/utils/apiResponse';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'relevance';

    if (!q || q.trim().length < 2) {
      return errorResponse('Search query must be at least 2 characters', 400);
    }

    const query = { status: 'published', $text: { $search: q } };
    if (category) query.category = category;

    const sortOption =
      sort === 'relevance'
        ? { score: { $meta: 'textScore' } }
        : sort === 'date'
        ? { publishedAt: -1 }
        : { views: -1 };

    const total = await Article.countDocuments(query);
    const articles = await Article.find(query, { score: { $meta: 'textScore' } })
      .populate('author', 'name username avatar')
      .populate('category', 'name slug color')
      .select('-content -likes -bookmarks')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return paginatedResponse(articles, {
      page, limit, total,
      pages: Math.ceil(total / limit),
      query: q,
    });
  } catch (error) {
    console.error('Search error:', error);
    return errorResponse('Search failed', 500);
  }
}
