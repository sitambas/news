import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';
import { errorResponse, successResponse } from '@/utils/apiResponse';
import { rateLimit } from '@/middleware/rateLimit';

const limiter = rateLimit({ max: 10, windowMs: 60 * 60 * 1000 });

export async function POST(request) {
  const { limited } = limiter(request);
  if (limited) return errorResponse('Too many requests', 429);

  try {
    await connectDB();
    const { name, username, email, password } = await request.json();

    if (!name || !username || !email || !password) {
      return errorResponse('All fields are required', 400);
    }

    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters', 400);
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) return errorResponse('Email already registered', 409);
      return errorResponse('Username already taken', 409);
    }

    const user = await User.create({ name, username, email, password });
    const token = signToken({ id: user._id, role: user.role, username: user.username });

    const response = successResponse(
      { user: user.toJSON(), token },
      'Registration successful',
      201
    );
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    return response;
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse('Registration failed', 500);
  }
}
