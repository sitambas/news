import connectDB from '@/lib/db';
import Comment from '@/models/Comment';
import Article from '@/models/Article';
import { getServerUser } from '@/lib/auth';
import { errorResponse, paginatedResponse, successResponse } from '@/utils/apiResponse';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!articleId) return errorResponse('articleId is required', 400);

    const query = { article: articleId, parent: null, isApproved: true };
    const total = await Comment.countDocuments(query);

    const comments = await Comment.find(query)
      .populate('author', 'name username avatar')
      .populate({
        path: 'replies',
        match: { isApproved: true },
        populate: { path: 'author', select: 'name username avatar' },
        options: { sort: { createdAt: 1 } },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return paginatedResponse(comments, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Comments GET error:', error);
    return errorResponse('Failed to fetch comments', 500);
  }
}

export async function POST(request) {
  try {
    const user = await getServerUser();
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { articleId, content, parentId } = await request.json();

    if (!articleId || !content) return errorResponse('articleId and content are required', 400);
    if (content.length > 1000) return errorResponse('Comment too long (max 1000 characters)', 400);

    const article = await Article.findById(articleId);
    if (!article) return errorResponse('Article not found', 404);
    if (!article.allowComments) return errorResponse('Comments are disabled for this article', 403);

    const comment = await Comment.create({
      article: articleId,
      author: user.id,
      content: content.trim(),
      parent: parentId || null,
    });

    await comment.populate('author', 'name username avatar');
    return successResponse(comment, 'Comment posted', 201);
  } catch (error) {
    console.error('Comment POST error:', error);
    return errorResponse('Failed to post comment', 500);
  }
}
