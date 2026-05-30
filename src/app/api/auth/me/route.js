import connectDB from '@/lib/db';
import User from '@/models/User';
import { getServerUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/apiResponse';

export async function GET() {
  try {
    const decoded = await getServerUser();
    if (!decoded) return errorResponse('Unauthorized', 401);

    await connectDB();
    const user = await User.findById(decoded.id).populate('preferences.categories', 'name slug color');
    if (!user) return errorResponse('User not found', 404);

    return successResponse(user.toJSON());
  } catch (error) {
    console.error('Me error:', error);
    return errorResponse('Failed to fetch user', 500);
  }
}
