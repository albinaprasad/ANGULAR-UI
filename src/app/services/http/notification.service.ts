import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BaseResponse } from "../../types/base-http.types";
import { HttpClient } from "@angular/common/http";
import { BaseHttpService } from "./base.service";
import { Notification } from "../../types/notification.types";

@Injectable({
  providedIn: 'root',
})
export class NotificationService extends BaseHttpService {
  constructor(private httpClient: HttpClient) {
    super();
  }

  sendNotification(notification: Notification): Observable<BaseResponse<Notification, string>> {
    return this.httpClient.post<BaseResponse<Notification, string>>(
      `${this.API_URL}/notifications/send/`,
      notification,
      { headers: this.getAuthHeaders() }
    );  
  }

  fetchNotifications(): Observable<BaseResponse<Notification[], string>> {
    return this.httpClient.get<BaseResponse<Notification[], string>>(
      `${this.API_URL}/notifications/group/`,
      { headers: this.getAuthHeaders() }
    );
  }

  markAsRead(notificationId: number): Observable<BaseResponse<null, string>> {
    return this.httpClient.post<BaseResponse<null, string>>(
      `${this.API_URL}/notifications/${notificationId}/mark-read/`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }
}
