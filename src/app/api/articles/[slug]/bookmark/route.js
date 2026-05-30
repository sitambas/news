import connectDB from '@/lib/db';
import Article from '@/models/Article';
import Bookmark from '@/models/Bookmark';
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

    const existing = await Bookmark.findOne({ user: user.id, article: article._id });

    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      return successResponse({ bookmarked: false }, 'Bookmark removed');
    } else {
      await Bookmark.create({ user: user.id, article: article._id });
      return successResponse({ bookmarked: true }, 'Article bookmarked');
    }
  } catch (error) {
    console.error('Bookmark error:', error);
    return errorResponse('Failed to toggle bookmark', 500);
  }
}
