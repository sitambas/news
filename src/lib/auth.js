import { cookies, headers } from 'next/headers';
import { verifyToken } from './jwt';

export async function getServerUser() {
  try {
    // 1. Try Authorization header first (Bearer token)
    const headerStore = await headers();
    const authHeader = headerStore.get('authorization') || headerStore.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded = verifyToken(token);
      if (decoded) return decoded;
    }

    // 2. Fallback to cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return null;
    const decoded = verifyToken(token);
    return decoded;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getServerUser();
  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }
  return { user };
}

export async function requireAdmin() {
  const user = await getServerUser();
  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }
  if (user.role !== 'admin' && user.role !== 'editor') {
    return { error: 'Forbidden', status: 403 };
  }
  return { user };
}
