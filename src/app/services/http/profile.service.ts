import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BaseHttpService } from './base.service';
import { BaseResponse } from '../../types/base-http.types';
import { ProfileUpdateRequest, UserProfile } from '../../types/profile.types';

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends BaseHttpService {
  constructor(private httpClient: HttpClient) {
    super();
  }

  private readonly profileEndpoint = `${this.API_URL}/profile`;

  getProfile(): Promise<BaseResponse<UserProfile, string>> {
    return firstValueFrom(
      this.httpClient.get<BaseResponse<UserProfile, string>>(
        this.profileEndpoint,
        { headers: this.getAuthHeaders() }
      )
    );
  }

  updateProfile(payload: ProfileUpdateRequest): Promise<BaseResponse<UserProfile, string>> {
    return firstValueFrom(
      this.httpClient.patch<BaseResponse<UserProfile, string>>(
        this.profileEndpoint,
        payload,
        { headers: this.getAuthHeaders() }
      )
    );
  }
}
