import { HttpClient, HttpParams } from "@angular/common/http";
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

    getGroupPermissions(groupId: number, params?: { page?: number; pageSize?: number }) : Observable<BaseResponse<unknown, string>> {
        let httpParams = new HttpParams();
        if (typeof params?.page === 'number') httpParams = httpParams.set('page', String(params.page));
        if (typeof params?.pageSize === 'number') httpParams = httpParams.set('page_size', String(params.pageSize));

        return this.httpClient.get<BaseResponse<unknown, string>>(
            `${this.API_URL}/api/groups/${groupId}/permissions`,
            { headers: this.getAuthHeaders(), params: httpParams }
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

    getAllPermissions(params?: { page?: number; pageSize?: number }): Observable<BaseResponse<unknown, string>> {
        let httpParams = new HttpParams();
        if (typeof params?.page === 'number') httpParams = httpParams.set('page', String(params.page));
        if (typeof params?.pageSize === 'number') httpParams = httpParams.set('page_size', String(params.pageSize));

        return this.httpClient.get<BaseResponse<unknown, string>>(
            `${this.API_URL}/api/permissions`,
            { headers: this.getAuthHeaders(), params: httpParams }
        );
    }
    
}
