export interface User {
    id: number;
    name: string;
    username: string;
    credits: number | undefined;
    email: string;
    isActive: boolean;
    role: 'user' | 'admin';
    type: 'regular' | 'google';
    subscription: 'free' | 'premium';
    stripeCustomerId?: string;
    profileImage?: File | string | undefined;
  }