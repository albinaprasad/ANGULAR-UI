import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { BaseResponse } from '../../types/base-http.types';
import {
  DashboardUser,
  StudentMark,
  SubjectPayload,
  UserRole,
} from '../../types/role-dashboard.types';
import { BaseHttpService } from './base.service';

@Injectable({ providedIn: 'root' })
export class RoleDashboardService extends BaseHttpService {
  constructor(private http: HttpClient) {
    super();
  }

  searchInstitutionUsers(role: UserRole | 'teacher' | 'student', query: string): Observable<BaseResponse<DashboardUser[], string>> {
    const params = new HttpParams()
      .set('role', role)
      .set('q', query.trim());

    return this.http
      .get<BaseResponse<DashboardUser[], string>>(`${this.API_URL}/core/institution/users/search`, {
        headers: this.getAuthHeaders(),
        params,
      })
      .pipe(catchError((err) => this.handleError(err)));
  }

  addDepartment(name: string): Observable<BaseResponse<{ id: number; name: string }, string>> {
    return this.http
      .post<BaseResponse<{ id: number; name: string }, string>>(
        `${this.API_URL}/core/institution/departments/add`,
        { name: name.trim() },
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError((err) => this.handleError(err)));
  }

  addTeacher(teacherUserId: number, departmentId: number): Observable<BaseResponse<{ id: number }, string>> {
    return this.http
      .post<BaseResponse<{ id: number }, string>>(
        `${this.API_URL}/core/institution/teachers/add`,
        { teacher_user_id: teacherUserId, department_id: departmentId },
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError((err) => this.handleError(err)));
  }

  addStudent(studentUserId: number, departmentId: number): Observable<BaseResponse<{ id: number }, string>> {
    return this.http
      .post<BaseResponse<{ id: number }, string>>(
        `${this.API_URL}/core/institution/students/add`,
        { student_user_id: studentUserId, department_id: departmentId },
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError((err) => this.handleError(err)));
  }

  addSubject(payload: SubjectPayload): Observable<BaseResponse<{ id: number }, string>> {
    return this.http
      .post<BaseResponse<{ id: number }, string>>(
        `${this.API_URL}/core/institution/subjects/add`,
        payload,
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError((err) => this.handleError(err)));
  }

  assignStudentToTeacher(studentUserId: number): Observable<BaseResponse<{ id: number }, string>> {
    return this.http
      .post<BaseResponse<{ id: number }, string>>(
        `${this.API_URL}/core/teacher/students/assign`,
        { student_user_id: studentUserId },
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError((err) => this.handleError(err)));
  }

  getStudentMarks(): Observable<BaseResponse<StudentMark[], string>> {
    return this.http
      .get<BaseResponse<StudentMark[], string>>(`${this.API_URL}/core/student/marks`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError((err) => this.handleError(err)));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message = this.getErrorMessage(error);
    return throwError(() => ({ ...error, friendlyMessage: message }));
  }

  getErrorMessage(error: HttpErrorResponse | null | undefined): string {
    if (!error) {
      return 'Unexpected error occurred. Please try again.';
    }

    if (error.status === 401) {
      return 'Session expired. Please login again.';
    }

    if (error.status === 403) {
      return 'You are not allowed to perform this action.';
    }

    if (error.status === 404) {
      return 'Requested resource was not found.';
    }

    if (error.status === 409) {
      return 'This record already exists or is already assigned.';
    }

    const apiMessage = (error.error?.error as string | undefined)
      || (error.error?.message as string | undefined)
      || error.message;

    return apiMessage || 'Unexpected error occurred. Please try again.';
  }
}
