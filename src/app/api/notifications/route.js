import connectDB from '@/lib/db';
import Notification from '@/models/Notification';
import { getServerUser } from '@/lib/auth';
import { errorResponse, successResponse, paginatedResponse } from '@/utils/apiResponse';

export async function GET(request) {
  try {
    const user = await getServerUser();
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const total = await Notification.countDocuments({ recipient: user.id });
    const unreadCount = await Notification.countDocuments({ recipient: user.id, isRead: false });

    const notifications = await Notification.find({ recipient: user.id })
      .populate('sender', 'name username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return paginatedResponse(notifications, {
      page, limit, total, pages: Math.ceil(total / limit), unreadCount,
    });
  } catch (error) {
    return errorResponse('Failed to fetch notifications', 500);
  }
}

export async function PUT(request) {
  try {
    const user = await getServerUser();
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    await Notification.updateMany({ recipient: user.id, isRead: false }, { isRead: true });
    return successResponse(null, 'All notifications marked as read');
  } catch (error) {
    return errorResponse('Failed to update notifications', 500);
  }
}
