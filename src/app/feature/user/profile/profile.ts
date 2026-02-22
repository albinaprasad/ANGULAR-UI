import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../services/http/profile.service';
import { ProfileUpdatePayload, UserProfile } from '../../../types/profile.types';
import { SnackbarService } from '../../../services/modal/snackbar.service';
import { PopupService } from '../../../services/modal/popup.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly maxAvatarFileSize = 5 * 1024 * 1024;

  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';
  avatarErrorMessage = '';
  isDragActive = false;
  selectedAvatarFile: File | null = null;
  emailValid = true;
  phoneValid = true;

  profile: UserProfile = this.toForm();

  genderOptions = [
    { label: 'Female', value: 'female' },
    { label: 'Male', value: 'male' },
    { label: 'Other', value: 'other' }
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
  locationOptions: Array<{ label: string; value: string }> = [];

  constructor(
    private profileService: ProfileService,
    private snackBarService: SnackbarService,
    private popupService: PopupService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.profileService.getLanguages(0, 10).subscribe(
      res => {
        console.log('Languages response:', res);
        if (res.message) {
          this.languageOptions = res.message.map(lang => ({ label: lang.name || '', value: lang.name || '' }));
          this.cdr.markForCheck();
        } else if (res.error) {
          this.snackBarService.error(res.error, 5000);
        }
      },
      error => {
        console.error('Error fetching languages:', error);
        this.snackBarService.error('Unable to load languages. Please try again.', 5000);
      }
    );

    this.profileService.getTimezones(0, 10).subscribe(
      res => {
        console.log('Timezones response:', res);
        if (res.message) {
          this.timezoneOptions = res.message.map(tz => ({ label: tz.name || '', value: tz.name || '' }));
          this.cdr.markForCheck();
        } else if (res.error) {
          this.snackBarService.error(res.error, 5000);
        }
      },
      error => {
        console.error('Error fetching timezones:', error);
        this.snackBarService.error('Unable to load timezones. Please try again.', 5000);
      }
    );

    this.profileService.getLocations(0, 10).subscribe(
      res => {
        console.log('Locations response:', res);
        if (res.message) {
          this.locationOptions = res.message.map(loc => {
            const locationLabel = loc.name || `${loc.city || ''}${loc.city && loc.country ? ', ' : ''}${loc.country || ''}`;
            return { label: locationLabel, value: locationLabel };
          }).filter(loc => !!loc.value);
          this.cdr.markForCheck();
        } else if (res.error) {
          this.snackBarService.error(res.error, 5000);
        }
      },
      error => {
        console.error('Error fetching locations:', error);
        this.snackBarService.error('Unable to load locations. Please try again.', 5000);
      }
    );    
  }

  async loadProfile(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      await this.profileService.getProfile().subscribe(
        res => {
          console.log('Profile response:', res);
          if (res.message) {
            this.profile = this.toForm(res.message);
            this.cdr.markForCheck();
            console.log('Profile response:', this.profile);
            if (res.error)
              this.snackBarService.error(res.error, 5000)
          } else if (res.error) {
            this.errorMessage = res.error;
          }
        }
      );
    
    } catch (error) {
      this.errorMessage = 'Unable to load profile. Please try again.';
      this.snackBarService.error(this.errorMessage, 5000)
    } finally {
      this.loading = false;
    }
  }

  async saveProfile(): Promise<void> {
    console.log('Saving profile with data:', this.profile);
    this.errorMessage = '';
    this.successMessage = '';
    this.emailValid = this.isEmailValid(this.profile.email);
    this.phoneValid = this.isPhoneValid(this.profile.phone);

    const validationErrors = this.getValidationErrors();
    if (validationErrors.length > 0) {
      this.errorMessage = validationErrors.join(' ');
      this.snackBarService.error(this.errorMessage, 3500);
      this.popupService.show('Invalid Format', this.errorMessage);
      return;
    }
    this.saving = true;

    const payload: ProfileUpdatePayload = {
      username: this.profile.username,
      fullName: this.profile.fullName,
      email: this.profile.email,
      phone: this.profile.phone,
      bio: this.profile.bio,
      location: this.profile.location,
      timezone: this.profile.timezone,
      language: this.profile.language,
      gender: this.profile.gender,
      avatarUrl: this.profile.avatarUrl,
      avatarFile: this.selectedAvatarFile
    };

    console.log('Constructed payload for update:', payload);

    try {
      this.profileService.updateProfile(payload).subscribe(
        res => {
          console.log('Update profile response:', res);
          if (res.message) {
            this.successMessage = 'Profile updated successfully!';
            this.profile = this.toForm(res.message);
            this.selectedAvatarFile = null;
            console.log('Updated profile:', this.profile);
            this.cdr.markForCheck();
            this.snackBarService.success(this.successMessage, 3000);
          }else if (res.error) {
            this.errorMessage = res.error;
            this.snackBarService.error(this.errorMessage, 3000);
          }
        }
      )
    } catch (error) {
      this.errorMessage = 'Unable to save profile. Please try again.';
      this.snackBarService.error(this.errorMessage, 3000);
    } finally {
      this.saving = false;
      this.loadProfile(); 
    }
  }

  updateEmailValidity(isValid: boolean): void {
    this.emailValid = isValid;
  }

  updatePhoneValidity(isValid: boolean): void {
    this.phoneValid = isValid;
  }

  onAvatarDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragActive = true;
    this.cdr.markForCheck();
  }

  onAvatarDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragActive = false;
    this.cdr.markForCheck();
  }

  onAvatarDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragActive = false;

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.readAvatarFile(file);
      this.cdr.markForCheck();
    }
  }

  onAvatarSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      this.readAvatarFile(file);
    }

    target.value = '';
    this.cdr.markForCheck();
  }

  clearAvatar(): void {
    this.profile.avatarUrl = '';
    this.selectedAvatarFile = null;
    this.avatarErrorMessage = '';
    this.cdr.markForCheck();
  }

  private readAvatarFile(file: File): void {
    this.avatarErrorMessage = '';
    this.successMessage = '';

    if (!file.type.startsWith('image/')) {
      this.avatarErrorMessage = 'Please choose an image file.';
      return;
    }

    if (file.size > this.maxAvatarFileSize) {
      this.avatarErrorMessage = 'Image must be smaller than 5MB.';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.profile.avatarUrl = typeof reader.result === 'string' ? reader.result : '';
      this.selectedAvatarFile = file;
      this.cdr.markForCheck();
    };
    reader.onerror = () => {
      this.avatarErrorMessage = 'Unable to read the selected image.';
    };

    reader.readAsDataURL(file);
  }

  handleLanguageClick(): void {
    this.profileService.getLanguages(0, 10).subscribe(
      res => {
        console.log('Languages response:', res);
        if (res.message) {
          this.languageOptions = res.message.map(lang => ({ label: lang.name || '', value: lang.name || '' }));
          this.cdr.markForCheck();
        } else if (res.error) {
          this.snackBarService.error(res.error, 5000);
        }
      },
      error => {
        console.error('Error fetching languages:', error);
        this.snackBarService.error('Unable to load languages. Please try again.', 5000);
      }
    );  
  }

  private toForm(profile?: UserProfile): UserProfile {
    return {
      email: profile?.email ?? '',
      username: profile?.username ?? '',
      fullName: profile?.fullName ?? '',
      phone: profile?.phone ?? '',
      title: profile?.title ?? '',
      bio: profile?.bio ?? '',
      location: profile?.location ?? '',
      timezone: profile?.timezone ?? '',
      language: profile?.language ?? '',
      gender: profile?.gender ?? '',
      avatarUrl: profile?.avatarUrl ?? '',
      roles: profile?.roles ?? []
    };
  }

  private getValidationErrors(): string[] {
    const errors: string[] = [];
    if (!this.emailValid) {
      errors.push('Email format is invalid.');
    }
    if (!this.phoneValid) {
      errors.push('Phone number format is invalid.');
    }
    return errors;
  }

  private isEmailValid(email: string | undefined): boolean {
    if (!email?.trim()) {
      return true;
    }
    console.log('Validating email:', email);
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  private isPhoneValid(phone: string | undefined): boolean {
    if (!phone?.trim()) {
      return true;
    }
    return /^\+?[0-9()\-\s]{7,20}$/.test(phone.trim());
  }
}
