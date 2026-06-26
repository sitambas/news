import connectDB from '@/lib/db';
import Category from '@/models/Category';
import { getServerUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/apiResponse';
import { findCategoryBySlug, normalizeCategorySlug } from '@/lib/categoryQueries';

function pickCategoryPayload(body, { includeSlug = false } = {}) {
  const allowed = ['name', 'description', 'color', 'icon', 'image', 'order', 'isActive', 'meta'];
  if (includeSlug && body.slug) allowed.unshift('slug');
  const payload = {};
  allowed.forEach((key) => {
    if (body[key] !== undefined) payload[key] = body[key];
  });
  if (typeof payload.description === 'string' && payload.description.length > 500) {
    payload.description = payload.description.slice(0, 500);
  }
  return payload;
}

function validationMessage(error) {
  if (error?.name === 'ValidationError') {
    const msg = Object.values(error.errors || {})[0]?.message;
    if (msg?.includes('longer than the maximum')) {
      return 'विवरण बहुत लंबा है (अधिकतम 500 अक्षर)';
    }
    return msg || 'डेटा मान्य नहीं है';
  }
  if (error?.code === 11000) return 'यह श्रेणी पहले से मौजूद है';
  return null;
}

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
    const updates = pickCategoryPayload(body);

    const existing = await findCategoryBySlug(slug);
    if (!existing) return errorResponse('श्रेणी नहीं मिली', 404);

    const category = await Category.findByIdAndUpdate(existing._id, updates, {
      new: true,
      runValidators: true,
    });
    if (!category) return errorResponse('श्रेणी नहीं मिली', 404);
    return successResponse(category, 'श्रेणी अपडेट हुई');
  } catch (error) {
    console.error('Category PUT error:', error);
    return errorResponse(validationMessage(error) || 'श्रेणी अपडेट करने में विफल', 500);
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
