import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { BaseResponse } from '../../types/base-http.types';
import {
  AddInstitutionSubjectPayload,
  AddExistingStudentPayload,
  AddExistingTeacherPayload,
  CreateStudentPayload,
  CreateStudentResponse,
  CreateTeacherPayload,
  CreateTeacherResponse,
  Department,
  DepartmentCreatePayload,
  DepartmentCreateResponse,
  DepartmentRemovePayload,
  DepartmentUpdatePayload,
  GetInstitutionSubjectsParams,
  InstitutionApiError,
  InstitutionSearchUser,
  InstitutionSubject,
  InstitutionSubjectsListResponse,
  ReassignInstitutionSubjectPayload,
  RemoveInstitutionSubjectPayload,
  RemoveStudentPayload,
  RemoveTeacherPayload,
  SetInstitutionSubjectPayload,
  SetInstitutionSubjectResponse,
  TrueSubject,
  UpdateStudentDepartmentPayload,
  UpdateTeacherDepartmentPayload,
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

  updateDepartment(payload: DepartmentUpdatePayload): Observable<Record<string, unknown>> {
    return this.http
      .post<BaseResponse<Record<string, unknown>, string>>(
        `${this.institutionBase}/departments/update`,
        payload,
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map((res) => res.message ?? {}),
        catchError((error) => this.handleError(error))
      );
  }

  removeDepartment(payload: DepartmentRemovePayload): Observable<Record<string, unknown>> {
    return this.http
      .post<BaseResponse<Record<string, unknown>, string>>(
        `${this.institutionBase}/departments/remove`,
        payload,
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map((res) => res.message ?? {}),
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

  updateTeacherDepartment(payload: UpdateTeacherDepartmentPayload): Observable<Record<string, unknown>> {
    return this.http
      .post<BaseResponse<Record<string, unknown>, string>>(
        `${this.institutionBase}/teachers/update`,
        payload,
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map((res) => res.message ?? {}),
        catchError((error) => this.handleError(error))
      );
  }

  removeTeacher(payload: RemoveTeacherPayload): Observable<Record<string, unknown>> {
    return this.http
      .post<BaseResponse<Record<string, unknown>, string>>(
        `${this.institutionBase}/teachers/remove`,
        payload,
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map((res) => res.message ?? {}),
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

  updateStudentDepartment(payload: UpdateStudentDepartmentPayload): Observable<Record<string, unknown>> {
    return this.http
      .post<BaseResponse<Record<string, unknown>, string>>(
        `${this.institutionBase}/students/update`,
        payload,
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map((res) => res.message ?? {}),
        catchError((error) => this.handleError(error))
      );
  }

  removeStudent(payload: RemoveStudentPayload): Observable<Record<string, unknown>> {
    return this.http
      .post<BaseResponse<Record<string, unknown>, string>>(
        `${this.institutionBase}/students/remove`,
        payload,
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map((res) => res.message ?? {}),
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
    return this.addInstitutionSubject(payload);
  }

  addInstitutionSubject(payload: AddInstitutionSubjectPayload): Observable<SetInstitutionSubjectResponse> {
    return this.http
      .post<BaseResponse<SetInstitutionSubjectResponse, string>>(
        `${this.institutionBase}/subjects/add`,
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

  reassignSubjectTeacher(payload: ReassignInstitutionSubjectPayload): Observable<Record<string, unknown>> {
    return this.http
      .post<BaseResponse<Record<string, unknown>, string>>(
        `${this.institutionBase}/subjects/update-assignment`,
        payload,
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map((res) => res.message ?? {}),
        catchError((error) => this.handleError(error))
      );
  }

  removeInstitutionSubject(payload: RemoveInstitutionSubjectPayload): Observable<Record<string, unknown>> {
    return this.http
      .post<BaseResponse<Record<string, unknown>, string>>(
        `${this.institutionBase}/subjects/remove`,
        payload,
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map((res) => res.message ?? {}),
        catchError((error) => this.handleError(error))
      );
  }

  getInstitutionSubjects(params?: GetInstitutionSubjectsParams): Observable<InstitutionSubjectsListResponse> {
    let httpParams = new HttpParams();
    const query = params?.q?.trim();
    if (query) httpParams = httpParams.set('q', query);
    if (typeof params?.page === 'number') httpParams = httpParams.set('page', String(params.page));
    if (typeof params?.pageSize === 'number') httpParams = httpParams.set('page_size', String(params.pageSize));

    return this.http
      .get<BaseResponse<unknown, string>>(`${this.institutionBase}/subjects`, {
        headers: this.getAuthHeaders(),
        params: httpParams,
      })
      .pipe(
        map((res) => this.normalizeInstitutionSubjects(res.message)),
        catchError((error) => this.handleError(error))
      );
  }

  private normalizeInstitutionSubjects(message: unknown): InstitutionSubjectsListResponse {
    const payload = message as Record<string, unknown> | null;
    const rawList = Array.isArray(message)
      ? message
      : Array.isArray(payload?.['subjects'])
        ? payload['subjects'] as unknown[]
        : [];

    const page = Number(payload?.['page'] ?? 1);
    const pageSize = Number(payload?.['page_size'] ?? (rawList.length || 20));
    const total = Number(payload?.['total'] ?? rawList.length);
    const hasMore = Boolean(payload?.['has_more'] ?? (page * pageSize < total));

    return {
      subjects: rawList.map((raw) => this.normalizeInstitutionSubject(raw)),
      page: Number.isFinite(page) && page > 0 ? page : 1,
      pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20,
      total: Number.isFinite(total) && total >= 0 ? total : rawList.length,
      hasMore,
    };
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
    return throwError(() => new InstitutionApiError(error.status, message));
  }
}
