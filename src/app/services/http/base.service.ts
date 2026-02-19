import { HttpHeaders } from "@angular/common/http";
import environmentJSON from "../../../../configs/environment.json";

export class BaseHttpService {

    protected readonly authTokenKey = environmentJSON.AUTH_TOKEN_KEY;
    protected readonly AUTH_TOKEN_KEY = environmentJSON.AUTH_TOKEN_KEY;
    protected readonly API_URL = environmentJSON.AUTH_API_URL;


    protected getAuthToken(): string | null {
        return localStorage.getItem(this.authTokenKey);
    }

    protected getAuthHeaders(): HttpHeaders {
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken() ?? ''}`
        });
    }

    protected getAuthHeadersForFormData(): HttpHeaders {
        return new HttpHeaders({
            'Authorization': `Bearer ${this.getAuthToken() ?? ''}`
        });
    }
}