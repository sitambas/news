import connectDB from '@/lib/db';
import User from '@/models/User';
import { getServerUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/apiResponse';

export async function PATCH(request, { params }) {
  try {
    const currentUser = await getServerUser();
    if (!currentUser) return errorResponse('Unauthorized', 401);
    if (currentUser.role !== 'admin') return errorResponse('Forbidden', 403);

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const user = await User.findById(id);
    if (!user) return errorResponse('User not found', 404);

    if (id === currentUser.id && body.isActive === false) {
      return errorResponse('You cannot deactivate your own account', 400);
    }

    if (body.role !== undefined) {
      if (!['user', 'author', 'editor', 'admin'].includes(body.role)) {
        return errorResponse('Invalid role', 400);
      }
      if (id === currentUser.id && body.role !== 'admin') {
        return errorResponse('You cannot change your own admin role', 400);
      }
      user.role = body.role;
    }

    if (body.isActive !== undefined) user.isActive = body.isActive;
    if (body.name !== undefined) user.name = body.name;
    if (body.bio !== undefined) user.bio = body.bio;

    await user.save({ validateBeforeSave: false });
    return successResponse(user.toJSON(), 'User updated');
  } catch (error) {
    console.error('Admin user PATCH error:', error);
    return errorResponse('Failed to update user', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const currentUser = await getServerUser();
    if (!currentUser) return errorResponse('Unauthorized', 401);
    if (currentUser.role !== 'admin') return errorResponse('Forbidden', 403);

    await connectDB();
    const { id } = await params;

    if (id === currentUser.id) {
      return errorResponse('You cannot delete your own account', 400);
    }

    const user = await User.findById(id);
    if (!user) return errorResponse('User not found', 404);

    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return errorResponse('Cannot delete the last active admin', 400);
      }
    }

    await User.deleteOne({ _id: id });
    return successResponse(null, 'User deleted');
  } catch (error) {
    console.error('Admin user DELETE error:', error);
    return errorResponse('Failed to delete user', 500);
  }
}
