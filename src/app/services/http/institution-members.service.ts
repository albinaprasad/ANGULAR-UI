import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { BaseResponse } from '../../types/base-http.types';
import {
  GetMembersParams,
  InstitutionMember,
  InstitutionMembersApiError,
  MembersNormalizedResponse,
} from '../../types/institution-members.types';
import { BaseHttpService } from './base.service';

interface RawMembersResponse {
  teachers?: unknown[];
  students?: unknown[];
  count?: number;
  total?: number;
  teacher_count?: number;
  student_count?: number;
  teacher_total?: number;
  student_total?: number;
  has_more?: boolean;
  teacher_has_more?: boolean;
  student_has_more?: boolean;
  offset?: number;
  page?: number;
  page_size?: number;
}

@Injectable({ providedIn: 'root' })
export class InstitutionMembersService extends BaseHttpService {
  private readonly institutionBase = `${this.API_URL}/core/institution`;

  constructor(private http: HttpClient) {
    super();
  }

  getMembers(params: GetMembersParams): Observable<MembersNormalizedResponse> {
    let httpParams = new HttpParams();

    if (params.role) httpParams = httpParams.set('role', params.role);
    if (typeof params.q === 'string' && params.q.trim()) httpParams = httpParams.set('q', params.q.trim());
    if (typeof params.pageSize === 'number') httpParams = httpParams.set('page_size', String(params.pageSize));
    if (typeof params.page === 'number') httpParams = httpParams.set('page', String(params.page));
    if (typeof params.offset === 'number') httpParams = httpParams.set('offset', String(params.offset));

    return this.http
      .get<BaseResponse<RawMembersResponse, string>>(`${this.institutionBase}/members`, {
        headers: this.getAuthHeaders(),
        params: httpParams,
      })
      .pipe(
        map((response) => this.normalizeResponse(response.message, params.role)),
        catchError((error) => this.handleError(error))
      );
  }

  private normalizeResponse(message: RawMembersResponse | null, role?: 'teacher' | 'student'): MembersNormalizedResponse {
    const payload = message ?? {};
    const teachers = (payload.teachers ?? []).map((item) => this.normalizeMember(item));
    const students = (payload.students ?? []).map((item) => this.normalizeMember(item));

    if (role === 'teacher') {
      return {
        teachers,
        students: [],
        teacherCount: Number(payload.count ?? teachers.length),
        studentCount: 0,
        teacherTotal: Number(payload.total ?? teachers.length),
        studentTotal: 0,
        teacherHasMore: Boolean(payload.has_more),
        studentHasMore: false,
        meta: {
          offset: Number(payload.offset ?? 0),
          page: Number(payload.page ?? 1),
          page_size: Number(payload.page_size ?? 20),
        },
      };
    }

    if (role === 'student') {
      return {
        teachers: [],
        students,
        teacherCount: 0,
        studentCount: Number(payload.count ?? students.length),
        teacherTotal: 0,
        studentTotal: Number(payload.total ?? students.length),
        teacherHasMore: false,
        studentHasMore: Boolean(payload.has_more),
        meta: {
          offset: Number(payload.offset ?? 0),
          page: Number(payload.page ?? 1),
          page_size: Number(payload.page_size ?? 20),
        },
      };
    }

    return {
      teachers,
      students,
      teacherCount: Number(payload.teacher_count ?? teachers.length),
      studentCount: Number(payload.student_count ?? students.length),
      teacherTotal: Number(payload.teacher_total ?? teachers.length),
      studentTotal: Number(payload.student_total ?? students.length),
      teacherHasMore: Boolean(payload.teacher_has_more),
      studentHasMore: Boolean(payload.student_has_more),
      meta: {
        offset: Number(payload.offset ?? 0),
        page: Number(payload.page ?? 1),
        page_size: Number(payload.page_size ?? 20),
      },
    };
  }

  private normalizeMember(raw: unknown): InstitutionMember {
    const item = (raw ?? {}) as Record<string, unknown>;
    const user = (item['user'] ?? {}) as Record<string, unknown>;
    const department = (item['department'] ?? {}) as Record<string, unknown>;
    const resolvedId = Number(
      item['id']
      ?? item['teacher_id']
      ?? item['student_id']
      ?? item['user_id']
      ?? user['id']
      ?? 0
    );
    const teacherId = Number(item['teacher_id'] ?? 0);
    const studentId = Number(item['student_id'] ?? 0);
    const userId = Number(item['user_id'] ?? user['id'] ?? 0);
    const departmentId = Number(item['department_id'] ?? department['id'] ?? 0);

    return {
      id: Number.isFinite(resolvedId) ? resolvedId : 0,
      user_id: Number.isFinite(userId) && userId > 0 ? userId : undefined,
      teacher_id: Number.isFinite(teacherId) && teacherId > 0 ? teacherId : undefined,
      student_id: Number.isFinite(studentId) && studentId > 0 ? studentId : undefined,
      username: String(user['username'] ?? item['username'] ?? ''),
      email: String(user['email'] ?? item['email'] ?? ''),
      first_name: String(user['first_name'] ?? item['first_name'] ?? ''),
      last_name: String(user['last_name'] ?? item['last_name'] ?? ''),
      department_id: Number.isFinite(departmentId) && departmentId > 0 ? departmentId : undefined,
      department_name: String(item['department_name'] ?? department['name'] ?? ''),
    };
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const statusMessages: Record<number, string> = {
      400: 'Invalid query. Check role or pagination parameters.',
      401: 'Session expired. Please login again.',
      403: 'You do not have permission to view institution members.',
      404: 'Institution members endpoint was not found.',
    };

    const backendMessage = typeof error.error?.error === 'string'
      ? error.error.error
      : typeof error.error?.message === 'string'
        ? error.error.message
        : '';

    const message = backendMessage || statusMessages[error.status] || 'Failed to load members.';
    return throwError(() => new InstitutionMembersApiError(error.status, message));
  }
}
