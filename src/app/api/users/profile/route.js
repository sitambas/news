import connectDB from '@/lib/db';
import User from '@/models/User';
import { getServerUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/apiResponse';

export async function PUT(request) {
  try {
    const currentUser = await getServerUser();
    if (!currentUser) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { name, bio, avatar, social, preferences } = await request.json();

    const user = await User.findById(currentUser.id);
    if (!user) return errorResponse('User not found', 404);

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (social) user.social = { ...user.social, ...social };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save({ validateBeforeSave: false });
    return successResponse(user.toJSON(), 'Profile updated');
  } catch (error) {
    return errorResponse('Failed to update profile', 500);
  }
}
