import connectDB from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';
import { errorResponse, successResponse } from '@/utils/apiResponse';
import { rateLimit } from '@/middleware/rateLimit';

const limiter = rateLimit({ max: 20, windowMs: 15 * 60 * 1000 });

export async function POST(request) {
  const { limited } = limiter(request);
  if (limited) return errorResponse('Too many login attempts. Please try again later.', 429);

  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return errorResponse('Invalid email or password', 401);
    }

    if (!user.isActive) {
      return errorResponse('Account has been deactivated', 403);
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken({ id: user._id, role: user.role, username: user.username });

    const response = successResponse({ user: user.toJSON(), token }, 'Login successful');
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Login failed', 500);
  }
}
