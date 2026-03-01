import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TableDescription, TableDataResponse, Tables } from '../../types/admin.types';
import { BaseHttpService } from './base.service';
import { BaseResponse } from '../../types/base-http.types';

@Injectable({ providedIn: 'root' })
export class DataService extends BaseHttpService {

  constructor(
    private http: HttpClient,
    
  ) {
    super();
  }

  getTables(): Observable<BaseResponse<string[],string>> {
    return this.http.get<BaseResponse<string[],string>>(
      `${this.API_URL}/api/tables`, {
        headers: this.getAuthHeaders()
      }
    );
  }

  getTableDescription(tableName: string): Observable<BaseResponse<TableDescription,string>> {
    return this.http.get<BaseResponse<TableDescription,string>>(
      `${this.API_URL}/api/tables/${tableName}/desc`, {
        headers: this.getAuthHeaders()
      }
    );
  }

  getTableData(tableName: string, page: number = 1, pageSize: number = 20): Observable<BaseResponse<TableDataResponse,string>> {
    return this.http.get<BaseResponse<TableDataResponse,string>>(`${this.API_URL}/api/tables/${tableName}/data`, {
      headers: this.getAuthHeaders(),
      params: { page: page.toString(), pageSize: pageSize.toString() }
    });
  }

  insertTableRow(tableName: string, rowData: Record<string, any>): Observable<BaseResponse<any, string>> {
    return this.http.post<BaseResponse<any, string>>(
      `${this.API_URL}/api/tables/${tableName}/data`,
      rowData,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  updateTableCell(tableName: string, rowId: any, column: string[], newValue: any[]): Observable<BaseResponse<string,string>> {
    if (column.length !== newValue.length) {
      throw new Error("Column and newValue arrays must have the same length.");
    }
    var updatePayload: {[key: string]: any} = {};
    for (let i = 0; i < column.length; i++) {
      updatePayload[column[i]] = newValue[i];
    };
    return this.http.patch<BaseResponse<string,string>>(`${this.API_URL}/api/tables/${tableName}/data/${rowId}`, 
     updatePayload ,
    {
      headers: this.getAuthHeaders()
    }
  );
  }
}
