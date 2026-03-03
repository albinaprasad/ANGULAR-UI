import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { BaseResponse } from '../../types/base-http.types';
import {
  AddExistingStudentPayload,
  AddExistingTeacherPayload,
  CreateStudentPayload,
  CreateStudentResponse,
  CreateTeacherPayload,
  CreateTeacherResponse,
  Department,
  DepartmentCreatePayload,
  DepartmentCreateResponse,
  InstitutionSearchUser,
  InstitutionSubject,
  SetInstitutionSubjectPayload,
  SetInstitutionSubjectResponse,
  TrueSubject,
} from '../../types/institution.types';
import { BaseHttpService } from './base.service';

@Injectable({ providedIn: 'root' })
export class InstitutionService extends BaseHttpService {
  private readonly institutionBase = `${this.API_URL}/core/institution`;

  constructor(private http: HttpClient) {
    super();
  }

  getDepartments(): Observable<Department[]> {
    return this.http
      .get<BaseResponse<Department[], string>>(`${this.institutionBase}/departments`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((res) => res.message ?? []),
        catchError((error) => this.handleError(error))
      );
  }

  createDepartment(payload: DepartmentCreatePayload): Observable<DepartmentCreateResponse> {
    return this.http
      .post<BaseResponse<DepartmentCreateResponse, string>>(
        `${this.institutionBase}/departments/add`,
        payload,
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map((res) => {
          if (!res.message) {
            throw new Error('Department creation returned empty response.');
          }
          return res.message;
        }),
        catchError((error) => this.handleError(error))
      );
  }

  createTeacher(payload: CreateTeacherPayload): Observable<CreateTeacherResponse> {
    return this.http
      .post<BaseResponse<CreateTeacherResponse, string>>(
        `${this.institutionBase}/teachers/create`,
        payload,
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map((res) => {
          if (!res.message) {
            throw new Error('Teacher creation returned empty response.');
          }
          return res.message;
        }),
        catchError((error) => this.handleError(error))
      );
  }

  createStudent(payload: CreateStudentPayload): Observable<CreateStudentResponse> {
    return this.http
      .post<BaseResponse<CreateStudentResponse, string>>(
        `${this.institutionBase}/students/create`,
        payload,
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map((res) => {
          if (!res.message) {
            throw new Error('Student creation returned empty response.');
          }
          return res.message;
        }),
        catchError((error) => this.handleError(error))
      );
  }

  searchUsers(role: 'teacher' | 'student', q: string): Observable<InstitutionSearchUser[]> {
    const params = new HttpParams().set('role', role).set('q', q.trim());

    return this.http
      .get<BaseResponse<InstitutionSearchUser[], string>>(`${this.institutionBase}/users/search`, {
        headers: this.getAuthHeaders(),
        params,
      })
      .pipe(
        map((res) => res.message ?? []),
        catchError((error) => this.handleError(error))
      );
  }

  addExistingTeacher(payload: AddExistingTeacherPayload): Observable<Record<string, unknown>> {
    return this.http
      .post<BaseResponse<Record<string, unknown>, string>>(
        `${this.institutionBase}/teachers/add`,
        payload,
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map((res) => res.message ?? {}),
        catchError((error) => this.handleError(error))
      );
  }

  addExistingStudent(payload: AddExistingStudentPayload): Observable<Record<string, unknown>> {
    return this.http
      .post<BaseResponse<Record<string, unknown>, string>>(
        `${this.institutionBase}/students/add`,
        payload,
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map((res) => res.message ?? {}),
        catchError((error) => this.handleError(error))
      );
  }

  getTrueSubjects(params?: { q?: string }): Observable<TrueSubject[]> {
    let httpParams = new HttpParams();
    const query = params?.q?.trim();
    if (query) {
      httpParams = httpParams.set('q', query);
    }

    return this.http
      .get<BaseResponse<TrueSubject[], string>>(`${this.institutionBase}/true-subjects`, {
        headers: this.getAuthHeaders(),
        params: httpParams,
      })
      .pipe(
        map((res) => res.message ?? []),
        catchError((error) => this.handleError(error))
      );
  }

  setInstitutionSubject(payload: SetInstitutionSubjectPayload): Observable<SetInstitutionSubjectResponse> {
    return this.http
      .post<BaseResponse<SetInstitutionSubjectResponse, string>>(
        `${this.institutionBase}/subjects/set`,
        payload,
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map((res) => {
          if (!res.message) {
            throw new Error('Subject mapping returned empty response.');
          }
          return res.message;
        }),
        catchError((error) => this.handleError(error))
      );
  }

  getInstitutionSubjects(): Observable<InstitutionSubject[]> {
    return this.http
      .get<BaseResponse<unknown, string>>(`${this.institutionBase}/subjects`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((res) => this.normalizeInstitutionSubjects(res.message)),
        catchError((error) => this.handleError(error))
      );
  }

  private normalizeInstitutionSubjects(message: unknown): InstitutionSubject[] {
    const payload = message as Record<string, unknown> | null;
    const rawList = Array.isArray(message)
      ? message
      : Array.isArray(payload?.['subjects'])
        ? payload['subjects'] as unknown[]
        : [];

    return rawList.map((raw) => this.normalizeInstitutionSubject(raw));
  }

  private normalizeInstitutionSubject(raw: unknown): InstitutionSubject {
    const item = (raw ?? {}) as Record<string, unknown>;
    const teacher = (item['teacher'] ?? {}) as Record<string, unknown>;
    const department = (item['department'] ?? {}) as Record<string, unknown>;

    return {
      id: Number(item['id'] ?? 0),
      true_subject_id: Number(item['true_subject_id'] ?? 0),
      name: String(item['name'] ?? ''),
      code: String(item['code'] ?? ''),
      semester: Number(item['semester'] ?? 0),
      department_id: Number(item['department_id'] ?? department['id'] ?? 0),
      teacher_id: Number(item['teacher_id'] ?? teacher['id'] ?? 0),
      department_name: String(item['department_name'] ?? department['name'] ?? ''),
      teacher_name: String(
        item['teacher_name']
          ?? teacher['name']
          ?? `${String(teacher['first_name'] ?? '')} ${String(teacher['last_name'] ?? '')}`.trim()
      ),
      teacher_email: String(item['teacher_email'] ?? teacher['email'] ?? ''),
    };
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const statusMessage: Record<number, string> = {
      400: 'Invalid request. Please verify input fields.',
      401: 'Session expired. Please login again.',
      403: 'You are not allowed to perform this action.',
      404: 'Requested resource was not found.',
      409: 'Record already exists or conflicts with current data.',
    };

    const backendMessage = typeof error.error?.error === 'string'
      ? error.error.error
      : typeof error.error?.message === 'string'
        ? error.error.message
        : '';

    const message = backendMessage || statusMessage[error.status] || 'Something went wrong. Please try again.';
    return throwError(() => new Error(message));
  }
}
