import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { BaseResponse } from '../../types/base-http.types';
import {
  GetTeacherStudentsParams,
  DashboardUser,
  StudentMark,
  SubjectPayload,
  TeacherSubjectGroup,
  TeacherStudent,
  TeacherStudentsGroupedResponse,
  TeacherAnswerKeyUploadResponse,
  TeacherOwnedSubject,
  TeacherPdfUploadResponse,
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

  getTeacherStudentMarks(studentUserId: number): Observable<StudentMark[]> {
    return this.http
      .get<BaseResponse<StudentMark[], string>>(`${this.API_URL}/core/teacher/students/${studentUserId}/marks`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) => response.message ?? []),
        catchError((err) => this.handleError(err))
      );
  }

  uploadTeacherPdf(file: File): Observable<TeacherPdfUploadResponse> {
    const formData = new FormData();
    formData.append('pdf', file);

    return this.http
      .post<BaseResponse<TeacherPdfUploadResponse, string>>(
        `${this.API_URL}/core/teacher/pdfs/upload`,
        formData,
        { headers: this.getAuthHeadersForFormData() }
      )
      .pipe(
        map((response) => {
          const payload = (response.message ?? {}) as Partial<TeacherPdfUploadResponse>;
          return {
            id: Number(payload.id ?? 0),
            teacher_user_id: Number(payload.teacher_user_id ?? 0),
            original_filename: String(payload.original_filename ?? ''),
            stored_filename: String(payload.stored_filename ?? ''),
            file_path: String(payload.file_path ?? ''),
            file_url: String(payload.file_url ?? ''),
          };
        }),
        catchError((err) => this.handleError(err))
      );
  }

  uploadTeacherSubjectAnswerKey(subjectId: number, file: File): Observable<TeacherAnswerKeyUploadResponse> {
    const formData = new FormData();
    formData.append('subject_id', String(subjectId));
    formData.append('pdf', file);

    return this.http
      .post<BaseResponse<TeacherAnswerKeyUploadResponse, string>>(
        `${this.API_URL}/core/teacher/subjects/answer-key/upload`,
        formData,
        { headers: this.getAuthHeadersForFormData() }
      )
      .pipe(
        map((response) => {
          const payload = (response.message ?? {}) as Partial<TeacherAnswerKeyUploadResponse>;
          return {
            id: Number(payload.id ?? 0),
            teacher_user_id: Number(payload.teacher_user_id ?? 0),
            subject_id: Number(payload.subject_id ?? 0),
            original_filename: String(payload.original_filename ?? ''),
            stored_filename: String(payload.stored_filename ?? ''),
            file_path: String(payload.file_path ?? ''),
            file_url: String(payload.file_url ?? ''),
          };
        }),
        catchError((err) => this.handleError(err))
      );
  }

  getTeacherSubjects(): Observable<TeacherOwnedSubject[]> {
    return this.getTeacherStudents().pipe(
      map((response) =>
        response.subjects
          .filter((subject) => Number(subject.subject_id) > 0)
          .map((subject) => ({
            subject_id: subject.subject_id,
            subject_name: subject.subject_name,
            subject_code: subject.subject_code,
          }))
      )
    );
  }

  getTeacherStudents(params?: GetTeacherStudentsParams): Observable<TeacherStudentsGroupedResponse> {
    let httpParams = new HttpParams();
    const query = params?.q?.trim();
    if (query) httpParams = httpParams.set('q', query);

    return this.http
      .get<BaseResponse<unknown, string>>(`${this.API_URL}/core/teacher/students`, {
        headers: this.getAuthHeaders(),
        params: httpParams,
      })
      .pipe(
        map((res) => this.normalizeTeacherStudents(res.message)),
        catchError((err) => this.handleError(err))
      );
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

  private normalizeTeacherStudents(message: unknown): TeacherStudentsGroupedResponse {
    const payload = (message ?? {}) as Record<string, unknown>;
    const rawSubjects = Array.isArray(payload['subjects']) ? payload['subjects'] : [];

    const subjects: TeacherSubjectGroup[] = rawSubjects.map((rawSubject) => {
      const subject = (rawSubject ?? {}) as Record<string, unknown>;
      const rawStudents = Array.isArray(subject['students']) ? subject['students'] : [];
      const students: TeacherStudent[] = rawStudents.map((rawStudent) => {
        const row = (rawStudent ?? {}) as Record<string, unknown>;
        return {
          id: Number(row['id'] ?? 0),
          user_id: Number(row['user_id'] ?? 0),
          username: String(row['username'] ?? ''),
          email: String(row['email'] ?? ''),
          first_name: String(row['first_name'] ?? ''),
          last_name: String(row['last_name'] ?? ''),
          department_id: Number(row['department_id'] ?? 0),
          department_name: String(row['department_name'] ?? ''),
          role: String(row['role'] ?? 'student'),
        };
      });

      return {
        subject_id: Number(subject['subject_id'] ?? 0),
        true_subject_id: Number(subject['true_subject_id'] ?? 0),
        subject_name: String(subject['subject_name'] ?? ''),
        subject_code: String(subject['subject_code'] ?? ''),
        semester: Number(subject['semester'] ?? 0),
        department_id: Number(subject['department_id'] ?? 0),
        department_name: String(subject['department_name'] ?? ''),
        institution_id: Number(subject['institution_id'] ?? 0),
        students,
        student_count: Number(subject['student_count'] ?? students.length),
      };
    });

    const subjectCount = Number(payload['subject_count'] ?? subjects.length);
    const studentCount = Number(
      payload['student_count']
      ?? subjects.reduce((sum, subject) => sum + (Number(subject.student_count) || subject.students.length), 0)
    );

    return {
      subjects,
      subject_count: Number.isFinite(subjectCount) ? subjectCount : subjects.length,
      student_count: Number.isFinite(studentCount) ? studentCount : 0,
    };
  }
}
