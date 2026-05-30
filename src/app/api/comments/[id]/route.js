import connectDB from '@/lib/db';
import Comment from '@/models/Comment';
import { getServerUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/apiResponse';

export async function PUT(request, { params }) {
  try {
    const user = await getServerUser();
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { id } = await params;
    const { content } = await request.json();

    const comment = await Comment.findById(id);
    if (!comment) return errorResponse('Comment not found', 404);

    const isOwner = comment.author.toString() === user.id;
    const isAdmin = ['admin', 'editor'].includes(user.role);
    if (!isOwner && !isAdmin) return errorResponse('Forbidden', 403);

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    return successResponse(comment, 'Comment updated');
  } catch (error) {
    return errorResponse('Failed to update comment', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getServerUser();
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { id } = await params;

    const comment = await Comment.findById(id);
    if (!comment) return errorResponse('Comment not found', 404);

    const isOwner = comment.author.toString() === user.id;
    const isAdmin = ['admin', 'editor'].includes(user.role);
    if (!isOwner && !isAdmin) return errorResponse('Forbidden', 403);

    await Comment.deleteMany({ parent: id });
    await Comment.deleteOne({ _id: id });

    return successResponse(null, 'Comment deleted');
  } catch (error) {
    return errorResponse('Failed to delete comment', 500);
  }
}
