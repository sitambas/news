import connectDB from '@/lib/db';
import Category from '@/models/Category';
import { getServerUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/apiResponse';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { slug } = await params;
    const category = await Category.findOne({ slug }).lean();
    if (!category) return errorResponse('Category not found', 404);
    return successResponse(category);
  } catch (error) {
    return errorResponse('Failed to fetch category', 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getServerUser();
    if (!user || !['admin', 'editor'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }
    await connectDB();
    const { slug } = await params;
    const body = await request.json();
    const category = await Category.findOneAndUpdate({ slug }, body, { new: true, runValidators: true });
    if (!category) return errorResponse('Category not found', 404);
    return successResponse(category, 'Category updated');
  } catch (error) {
    return errorResponse('Failed to update category', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getServerUser();
    if (!user || user.role !== 'admin') return errorResponse('Forbidden', 403);
    await connectDB();
    const { slug } = await params;
    const category = await Category.findOneAndDelete({ slug });
    if (!category) return errorResponse('Category not found', 404);
    return successResponse(null, 'Category deleted');
  } catch (error) {
    return errorResponse('Failed to delete category', 500);
  }
}
