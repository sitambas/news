import connectDB from '@/lib/db';
import Article from '@/models/Article';
import { getServerUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/apiResponse';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { slug } = await params;

    const article = await Article.findOne({ slug, status: 'published' })
      .populate('author', 'name username avatar bio social')
      .populate('category', 'name slug color')
      .populate('relatedArticles', 'title slug coverImage publishedAt readingTime')
      .lean();

    if (!article) return errorResponse('Article not found', 404);

    // Increment views (fire-and-forget)
    Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } }).exec();

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

    const article = await Article.findOne({ slug });
    if (!article) return errorResponse('Article not found', 404);

    const isOwner = article.author.toString() === user.id;
    const isAdmin = ['admin', 'editor'].includes(user.role);
    if (!isOwner && !isAdmin) return errorResponse('Forbidden', 403);

    const allowedFields = ['title', 'content', 'excerpt', 'category', 'tags', 'status',
      'coverImage', 'coverImageAlt', 'isBreaking', 'isFeatured', 'isTrending',
      'allowComments', 'meta', 'scheduledAt', 'relatedArticles', 'aiSummary'];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) article[field] = body[field];
    });

    await article.save();
    await article.populate('author', 'name username avatar');
    await article.populate('category', 'name slug color');

    return successResponse(article, 'Article updated successfully');
  } catch (error) {
    console.error('Article PUT error:', error);
    return errorResponse('Failed to update article', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getServerUser();
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { slug } = await params;

    const article = await Article.findOne({ slug });
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
