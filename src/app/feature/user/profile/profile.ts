import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../services/http/profile.service';
import { ProfileUpdateRequest, UserProfile, UserProfileForm } from '../../../types/profile.types';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  profile: UserProfileForm = this.toForm();

  genderOptions = [
    { label: 'Female', value: 'female' },
    { label: 'Male', value: 'male' },
    { label: 'Non-binary', value: 'non-binary' },
    { label: 'Prefer not to say', value: 'na' }
  ];

  timezoneOptions = [
    { label: 'UTC-08:00 (Pacific)', value: 'UTC-08:00' },
    { label: 'UTC-07:00 (Mountain)', value: 'UTC-07:00' },
    { label: 'UTC-06:00 (Central)', value: 'UTC-06:00' },
    { label: 'UTC-05:00 (Eastern)', value: 'UTC-05:00' },
    { label: 'UTC+00:00 (GMT)', value: 'UTC+00:00' },
    { label: 'UTC+05:30 (India)', value: 'UTC+05:30' }
  ];

  languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' },
    { label: 'German', value: 'de' },
    { label: 'Hindi', value: 'hi' }
  ];

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  async loadProfile(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      const response = await this.profileService.getProfile();
      if (response.message) {
        this.profile = this.toForm(response.message);
      } else if (response.error) {
        this.errorMessage = response.error;
      }
    } catch (error) {
      this.errorMessage = 'Unable to load profile. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async saveProfile(): Promise<void> {
    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: ProfileUpdateRequest = {
      fullName: this.profile.fullName,
      email: this.profile.email,
      phone: this.profile.phone,
      title: this.profile.title,
      bio: this.profile.bio,
      location: this.profile.location,
      timezone: this.profile.timezone,
      language: this.profile.language,
      gender: this.profile.gender,
      avatarUrl: this.profile.avatarUrl
    };

    try {
      const response = await this.profileService.updateProfile(payload);
      if (response.message) {
        this.profile = this.toForm(response.message);
        this.successMessage = 'Profile updated successfully.';
      } else if (response.error) {
        this.errorMessage = response.error;
      }
    } catch (error) {
      this.errorMessage = 'Unable to save profile. Please try again.';
    } finally {
      this.saving = false;
    }
  }

  private toForm(profile?: UserProfile): UserProfileForm {
    return {
      email: profile?.email ?? '',
      fullName: profile?.fullName ?? '',
      phone: profile?.phone ?? '',
      title: profile?.title ?? '',
      bio: profile?.bio ?? '',
      location: profile?.location ?? '',
      timezone: profile?.timezone ?? '',
      language: profile?.language ?? '',
      gender: profile?.gender ?? '',
      avatarUrl: profile?.avatarUrl ?? ''
    };
  }
}
