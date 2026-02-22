export type UserProfile = {
  id?: number;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  title?: string;
  dateOfBirth?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  language?: string;
  gender?: string;
  avatarUrl?: string;
  roles?: string[];
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
export type ProfileUpdatePayload = ProfileUpdateRequest & {
  avatarFile?: File | null;
};

export type UserProfileApi = {
  id?: number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  date_of_birth?: string;
  bio?: string;
  gender?: string;
  timezone?: string;
  language?: string;
  location?: string;
  avatar_url?: string;
  title?: string[];
};

export type Language = {
  id?: number;
  code?: string;
  name?: string;
}

export type Timezone = {
  name?: string;
}

export type Location = {
  id?: number;
  name?: string;
  city?: string;
  country?: string;
}
