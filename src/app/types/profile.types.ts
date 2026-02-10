export type UserProfile = {
  id?: number;
  username?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  title?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  language?: string;
  gender?: string;
  avatarUrl?: string;
};

export type UserProfileForm = {
  email: string;
  fullName: string;
  phone: string;
  title: string;
  bio: string;
  location: string;
  timezone: string;
  language: string;
  gender: string;
  avatarUrl: string;
};

export type ProfileUpdateRequest = Partial<UserProfile>;
