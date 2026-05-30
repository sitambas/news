'use client';

import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';

export default function AuthInitializer() {
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, []);

  return null;
}
