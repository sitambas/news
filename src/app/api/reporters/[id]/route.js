import connectDB from '@/lib/db';
import Reporter from '@/models/Reporter';
import Article from '@/models/Article';
import { getServerUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/apiResponse';
import mongoose from 'mongoose';

function normalizeLocations(locations, defaultLocation) {
  const list = Array.isArray(locations)
    ? locations.map((l) => l?.trim()).filter(Boolean)
    : [];
  if (list.length) return [...new Set(list)];
  if (defaultLocation?.trim()) return [defaultLocation.trim()];
  return [];
}

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Reporter not found', 404);
    }

    const reporter = await Reporter.findById(id).lean();
    if (!reporter) {
      return errorResponse('Reporter not found', 404);
    }

    return successResponse(reporter);
  } catch (error) {
    console.error('Reporter GET error:', error);
    return errorResponse('Failed to fetch reporter', 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getServerUser();
    if (!user || !['admin', 'editor'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }

    await connectDB();
    const { id } = await params;
    const reporter = await Reporter.findById(id);
    if (!reporter) return errorResponse('Reporter not found', 404);

    const { name, locations, defaultLocation, bio, order, isActive } = await request.json();
    if (name !== undefined) reporter.name = name.trim();
    if (locations !== undefined || defaultLocation !== undefined) {
      const locationList = normalizeLocations(
        locations !== undefined ? locations : reporter.locations,
        defaultLocation !== undefined ? defaultLocation : reporter.defaultLocation
      );
      reporter.locations = locationList;
      reporter.defaultLocation = locationList[0] || '';
    }
    if (bio !== undefined) reporter.bio = bio.trim();
    if (order !== undefined) reporter.order = order;
    if (isActive !== undefined) reporter.isActive = isActive;

    await reporter.save();
    return successResponse(reporter, 'Reporter updated successfully');
  } catch (error) {
    if (error.code === 11000) return errorResponse('Reporter already exists', 409);
    console.error('Reporter PUT error:', error);
    return errorResponse('Failed to update reporter', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getServerUser();
    if (!user || !['admin', 'editor'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }

    await connectDB();
    const { id } = await params;
    const reporter = await Reporter.findById(id);
    if (!reporter) return errorResponse('Reporter not found', 404);

    const inUse = await Article.countDocuments({ reporter: id });
    if (inUse > 0) {
      return errorResponse(`Reporter is used in ${inUse} article(s). Deactivate instead.`, 400);
    }

    await Reporter.deleteOne({ _id: id });
    return successResponse(null, 'Reporter deleted successfully');
  } catch (error) {
    console.error('Reporter DELETE error:', error);
    return errorResponse('Failed to delete reporter', 500);
  }
}
