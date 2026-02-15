import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseHttpService } from './base.service';
import { BaseResponse } from '../../types/base-http.types';
import { Language, Location, ProfileUpdatePayload, Timezone, UserProfile, UserProfileApi } from '../../types/profile.types';

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends BaseHttpService {
  constructor(private httpClient: HttpClient) {
    super();
  }

  private readonly profileEndpoint = `${this.API_URL}/profile`;

  getProfile(): Observable<BaseResponse<UserProfile, string>> {
    return this.httpClient.get<BaseResponse<UserProfileApi, string>>(
        this.profileEndpoint,
        { headers: this.getAuthHeaders() }
      ).pipe(
        map((response) => ({
          ...response,
          message: response.message ? this.toUserProfile(response.message) : null
        }))
      );
  }

  updateProfile(payload: ProfileUpdatePayload): Observable<BaseResponse<UserProfile, string>> {
    return this.httpClient.post<BaseResponse<UserProfileApi, string>>(
        `${this.profileEndpoint}/update/`,
        this.toApiPayload(payload),
        { headers: this.getAuthHeadersForFormData() }
      ).pipe(
        map((response) => ({
          ...response,
          message: response.message ? this.toUserProfile(response.message) : null
        }))
      );
  }

  getLanguages(offset:number, limit:number): Observable<BaseResponse<Language[], string>> {
    return this.httpClient.get<BaseResponse<Language[], string>>(
      `${this.API_URL}/profile/languages/${offset}/${limit}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getTimezones(offset:number, limit:number): Observable<BaseResponse<Timezone[], string>> {
    return this.httpClient.get<BaseResponse<Timezone[], string>>(
      `${this.API_URL}/profile/timezones/${offset}/${limit}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getLocations(offset:number, limit:number): Observable<BaseResponse<Location[], string>> {
    return this.httpClient.get<BaseResponse<Location[], string>>(
      `${this.API_URL}/profile/locations/${offset}/${limit}`,
      { headers: this.getAuthHeaders() }
    );
  }

  private toUserProfile(payload: UserProfileApi): UserProfile {
    const firstName = payload.first_name?.trim() ?? '';
    const lastName = payload.last_name?.trim() ?? '';
    const fullName = `${firstName} ${lastName}`.trim();
    const title = Array.isArray(payload.title) ? payload.title.join(', ') : payload.title || '';
    console.log('toUserProfile payload:', payload);
    let gender = undefined;
    if (payload.gender === 'M') {
      gender = 'male';
    } else if (payload.gender === 'F') {
      gender = 'female';
    } else if (payload.gender === 'O') {
      gender = 'other';
    }

    return {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      firstName: payload.first_name,
      lastName: payload.last_name,
      fullName,
      phone: payload.phone_number,
      dateOfBirth: payload.date_of_birth,
      bio: payload.bio,
      location: payload.location,
      timezone: payload.timezone,
      language: payload.language,
      gender,
      avatarUrl: this.resolveAvatarUrl(payload.avatar_url),
      title,
      roles: payload.title
    };
  }

  private resolveAvatarUrl(avatarUrl?: string): string {
    if (!avatarUrl) {
      return '';
    }

    // Keep already-resolved URLs and file previews intact.
    if (/^(https?:)?\/\//i.test(avatarUrl) || avatarUrl.startsWith('data:')) {
      return avatarUrl;
    }

    const baseUrl = this.API_URL.endsWith('/') ? this.API_URL : `${this.API_URL}/`;

    try {
      return new URL(avatarUrl, baseUrl).toString();
    } catch {
      return avatarUrl;
    }
  }

  private toApiPayload(payload: ProfileUpdatePayload): FormData {
    const toApiGender = (gender?: string): string | undefined => {
      if (!gender) return undefined;
      if (gender === 'male') return 'M';
      if (gender === 'female') return 'F';
      if (gender === 'other') return 'O';
      return gender;
    };

    const apiPayload: any = {
      username: payload.username,
      email: payload.email,
      phone_number: payload.phone,
      date_of_birth: payload.dateOfBirth,
      bio: payload.bio,
      gender: toApiGender(payload.gender),
      timezone: payload.timezone,
      language: payload.language,
      location: payload.location
    };

    if (payload.fullName !== undefined) {
      const [firstName = '', ...rest] = payload.fullName.trim().split(/\s+/);
      apiPayload.first_name = firstName;
      apiPayload.last_name = rest.join(' ');
    }

    const formData = new FormData();

    for (const [key, value] of Object.entries(apiPayload)) {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value as any);
      }
    }

    if (payload.avatarFile) {
      formData.append('avatar', payload.avatarFile);
    }

    return formData;
  }

}
