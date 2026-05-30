import connectDB from '@/lib/db';
import Category from '@/models/Category';
import { getServerUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/apiResponse';

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();
    return successResponse(categories);
  } catch (error) {
    console.error('Categories GET error:', error);
    return errorResponse('Failed to fetch categories', 500);
  }
}

export async function POST(request) {
  try {
    const user = await getServerUser();
    if (!user || !['admin', 'editor'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }

    await connectDB();
    const { name, description, color, icon, image, parent, order, meta } = await request.json();

    if (!name) return errorResponse('Category name is required', 400);

    const category = await Category.create({ name, description, color, icon, image, parent, order, meta });
    return successResponse(category, 'Category created successfully', 201);
  } catch (error) {
    if (error.code === 11000) return errorResponse('Category already exists', 409);
    console.error('Category POST error:', error);
    return errorResponse('Failed to create category', 500);
  }
}
