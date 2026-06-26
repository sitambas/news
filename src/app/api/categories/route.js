import connectDB from '@/lib/db';
import Category from '@/models/Category';
import { getServerUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/apiResponse';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === '1';
    const user = all ? await getServerUser() : null;
    const isStaff = user && ['admin', 'editor', 'author'].includes(user.role);

    const query = isStaff && all ? {} : { isActive: true };
    const categories = await Category.find(query)
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
    const body = await request.json();
    const { name, slug, color, icon, image, parent, order, meta, isActive } = body;

    if (!name?.trim()) return errorResponse('Category name is required', 400);

    let categorySlug = slug?.trim().toLowerCase();
    if (!categorySlug) {
      const slugify = (await import('slugify')).default;
      categorySlug = slugify(name, { lower: true, strict: true });
    }
    if (!categorySlug) {
      return errorResponse('Slug is required for Hindi names (e.g. politics, local-news)', 400);
    }

    const description =
      typeof body.description === 'string' && body.description.length > 500
        ? body.description.slice(0, 500)
        : (body.description || '');

    const category = await Category.create({
      name: name.trim(),
      slug: categorySlug,
      description,
      color,
      icon,
      image,
      parent,
      order,
      meta,
      isActive,
    });
    return successResponse(category, 'श्रेणी बनाई गई', 201);
  } catch (error) {
    if (error.code === 11000) return errorResponse('यह श्रेणी पहले से मौजूद है', 409);
    console.error('Category POST error:', error);
    const msg = error?.name === 'ValidationError' ? 'विवरण बहुत लंबा है (अधिकतम 500 अक्षर)' : 'श्रेणी बनाने में विफल';
    return errorResponse(msg, 500);
  }
}
