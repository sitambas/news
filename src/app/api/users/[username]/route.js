import connectDB from '@/lib/db';
import User from '@/models/User';
import { errorResponse, successResponse } from '@/utils/apiResponse';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { username } = await params;
    const user = await User.findOne({ username, isActive: true })
      .select('name username avatar bio social role createdAt')
      .lean();
    if (!user) return errorResponse('User not found', 404);
    return successResponse(user);
  } catch (error) {
    return errorResponse('Failed to fetch user', 500);
  }
}
