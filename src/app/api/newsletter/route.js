import connectDB from '@/lib/db';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import { errorResponse, successResponse } from '@/utils/apiResponse';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email?.trim()) return errorResponse('ईमेल आवश्यक है', 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse('अमान्य ईमेल पता', 400);
    }

    await connectDB();
    const normalized = email.trim().toLowerCase();

    const existing = await NewsletterSubscriber.findOne({ email: normalized });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
      }
      return successResponse(null, 'आप पहले से सदस्य हैं');
    }

    await NewsletterSubscriber.create({ email: normalized });
    return successResponse(null, 'सदस्यता सफल', 201);
  } catch (error) {
    if (error.code === 11000) return successResponse(null, 'आप पहले से सदस्य हैं');
    console.error('Newsletter POST error:', error);
    return errorResponse('सदस्यता विफल', 500);
  }
}
