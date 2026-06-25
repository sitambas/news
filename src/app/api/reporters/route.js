import connectDB from '@/lib/db';
import Reporter from '@/models/Reporter';
import { getServerUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/apiResponse';

function normalizeLocations(locations, defaultLocation) {
  const list = Array.isArray(locations)
    ? locations.map((l) => l?.trim()).filter(Boolean)
    : [];
  if (list.length) return [...new Set(list)];
  if (defaultLocation?.trim()) return [defaultLocation.trim()];
  return [];
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === '1';
    const user = all ? await getServerUser() : null;
    const isStaff = user && ['admin', 'editor', 'author'].includes(user.role);

    const query = isStaff && all ? {} : { isActive: true };
    const reporters = await Reporter.find(query)
      .sort({ order: 1, name: 1 })
      .lean();

    return successResponse(reporters);
  } catch (error) {
    console.error('Reporters GET error:', error);
    return errorResponse('Failed to fetch reporters', 500);
  }
}

export async function POST(request) {
  try {
    const user = await getServerUser();
    if (!user || !['admin', 'editor'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }

    await connectDB();
    const { name, locations, defaultLocation, bio, order, isActive } = await request.json();
    if (!name?.trim()) return errorResponse('Reporter name is required', 400);

    const locationList = normalizeLocations(locations, defaultLocation);

    const reporter = await Reporter.create({
      name: name.trim(),
      locations: locationList,
      defaultLocation: locationList[0] || '',
      bio: bio?.trim() || '',
      order: order ?? 0,
      isActive: isActive !== false,
    });

    return successResponse(reporter, 'Reporter created successfully', 201);
  } catch (error) {
    if (error.code === 11000) return errorResponse('Reporter already exists', 409);
    console.error('Reporters POST error:', error);
    return errorResponse('Failed to create reporter', 500);
  }
}
