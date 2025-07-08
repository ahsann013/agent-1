import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/types';
interface UserState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  updateUser: (userData: Partial<User>) => void;
  clearUser: () => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      clearUser: () => set({ user: null, token: null }),
    }),
    {
      name: 'user-storage',
    }
  )
);

export default useUserStore; 