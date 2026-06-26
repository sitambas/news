import connectDB from '@/lib/db';
import ContactMessage from '@/models/ContactMessage';
import { errorResponse, successResponse } from '@/utils/apiResponse';

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return errorResponse('नाम, ईमेल और संदेश आवश्यक हैं', 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse('अमान्य ईमेल पता', 400);
    }

    await connectDB();
    await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || 'सामान्य पूछताछ',
      message: message.trim(),
    });

    return successResponse(null, 'संदेश प्राप्त हुआ');
  } catch (error) {
    console.error('Contact POST error:', error);
    return errorResponse('संदेश भेजने में विफल', 500);
  }
}
