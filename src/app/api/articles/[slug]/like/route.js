import connectDB from '@/lib/db';
import Article from '@/models/Article';
import { getServerUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/apiResponse';

export async function POST(request, { params }) {
  try {
    const user = await getServerUser();
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { slug } = await params;

    const article = await Article.findOne({ slug });
    if (!article) return errorResponse('Article not found', 404);

    const userId = user.id;
    const hasLiked = article.likes.includes(userId);

    if (hasLiked) {
      article.likes.pull(userId);
    } else {
      article.likes.push(userId);
    }

    await article.save({ validateBeforeSave: false });
    return successResponse({ liked: !hasLiked, likeCount: article.likes.length });
  } catch (error) {
    console.error('Like error:', error);
    return errorResponse('Failed to toggle like', 500);
  }
}
