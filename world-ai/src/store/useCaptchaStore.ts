import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CaptchaState {
  isVerified: boolean;
  setVerified: (verified: boolean) => void;
}

export const useCaptchaStore = create<CaptchaState>()(
  persist(
    (set) => ({
      isVerified: false,
      setVerified: (verified) => set({ isVerified: verified }),
    }),
    {
      name: 'captcha-storage', // unique name for localStorage key
    }
  )
); 