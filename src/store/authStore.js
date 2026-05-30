import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.message);
          set({ user: data.data.user, token: data.data.token, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      register: async (name, username, email, password) => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, username, email, password }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.message);
          set({ user: data.data.user, token: data.data.token, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      logout: async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        set({ user: null, token: null });
      },

      fetchUser: async () => {
        try {
          const res = await fetch('/api/auth/me');
          const data = await res.json();
          if (data.success) {
            set({ user: data.data });
          } else {
            set({ user: null, token: null });
          }
        } catch {
          set({ user: null, token: null });
        }
      },

      isAdmin: () => ['admin', 'editor'].includes(get().user?.role),
      isAuthor: () => ['admin', 'editor', 'author'].includes(get().user?.role),
      isAuthenticated: () => !!get().user,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;
