import connectDB from '@/lib/db';
import User from '@/models/User';
import { getServerUser } from '@/lib/auth';
import { errorResponse, paginatedResponse } from '@/utils/apiResponse';

export async function GET(request) {
  try {
    const currentUser = await getServerUser();
    if (!currentUser) return errorResponse('Unauthorized', 401);
    if (!['admin', 'editor'].includes(currentUser.role)) {
      return errorResponse('Forbidden', 403);
    }

    await connectDB();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const role = searchParams.get('role');
    const search = searchParams.get('search')?.trim();
    const sort = searchParams.get('sort') || '-createdAt';

    const query = {};
    if (role && role !== 'all') query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return paginatedResponse(users, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    });
  } catch (error) {
    console.error('Admin users GET error:', error);
    return errorResponse('Failed to fetch users', 500);
  }
}
