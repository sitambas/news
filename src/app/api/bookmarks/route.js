import connectDB from '@/lib/db';
import Bookmark from '@/models/Bookmark';
import { getServerUser } from '@/lib/auth';
import { errorResponse, paginatedResponse } from '@/utils/apiResponse';

export async function GET(request) {
  try {
    const user = await getServerUser();
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const total = await Bookmark.countDocuments({ user: user.id });
    const bookmarks = await Bookmark.find({ user: user.id })
      .populate({
        path: 'article',
        select: 'title slug excerpt coverImage publishedAt readingTime',
        populate: [
          { path: 'author', select: 'name username avatar' },
          { path: 'reporter', select: 'name defaultLocation locations slug' },
          { path: 'category', select: 'name slug color' },
        ],
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return paginatedResponse(bookmarks, {
      page, limit, total, pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse('Failed to fetch bookmarks', 500);
  }
}
