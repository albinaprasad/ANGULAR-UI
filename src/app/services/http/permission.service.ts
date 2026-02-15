import { HttpClient } from "@angular/common/http";
import { BaseResponse } from "../../types/base-http.types";
import { PermissionGroup, Permissions } from "../../types/permission.types";
import { BaseHttpService } from "./base.service";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class PermissionService extends BaseHttpService {
    constructor(private httpClient: HttpClient) {
        super();
    }

    getGroupPermissions(groupId: number) : Observable<BaseResponse<Permissions[], string>> {
        return this.httpClient.get<BaseResponse<Permissions[], string>>(
            `${this.API_URL}/api/groups/${groupId}/permissions`,
            { headers: this.getAuthHeaders() }
        )
    }

    updateGroupPermission(groupId: number, permissionId: number, assigned: boolean): Observable<BaseResponse<Permissions[], string>> {
        return this.httpClient.post<BaseResponse<Permissions[], string>>(
            `${this.API_URL}/api/groups/${groupId}/permissions/${permissionId}/update`,
            { assigned },
            { headers: this.getAuthHeaders() }
        );
    }

    getGroups() {
        return this.httpClient.get<BaseResponse<PermissionGroup[], string>>(
            `${this.API_URL}/api/groups`,
            { headers: this.getAuthHeaders() }
        );
    }

    getAllPermissions(): Observable<BaseResponse<Permissions[], string>> {
        return this.httpClient.get<BaseResponse<Permissions[], string>>(
            `${this.API_URL}/api/permissions`,
            { headers: this.getAuthHeaders() }
        );
    }
    
}
