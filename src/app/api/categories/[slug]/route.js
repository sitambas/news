import connectDB from '@/lib/db';
import Category from '@/models/Category';
import { getServerUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/apiResponse';
import { findCategoryBySlug, normalizeCategorySlug } from '@/lib/categoryQueries';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const category = await findCategoryBySlug(slug);
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
    const allowed = ['name', 'description', 'color', 'icon', 'image', 'order', 'isActive', 'meta'];
    const updates = {};
    allowed.forEach((key) => {
      if (body[key] !== undefined) updates[key] = body[key];
    });

    const lookupSlug = normalizeCategorySlug(slug);
    const category = await Category.findOneAndUpdate({ slug: lookupSlug }, updates, { new: true, runValidators: true });
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
    const category = await Category.findOneAndDelete({ slug: normalizeCategorySlug(slug) });
    if (!category) return errorResponse('Category not found', 404);
    return successResponse(null, 'Category deleted');
  } catch (error) {
    return errorResponse('Failed to delete category', 500);
  }
}
