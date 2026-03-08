export interface Department {
  id: number;
  name: string;
}

export interface DepartmentCreatePayload {
  name: string;
}

export interface DepartmentUpdatePayload {
  department_id: number;
  name: string;
}

export interface DepartmentRemovePayload {
  department_id: number;
}

export interface DepartmentCreateResponse {
  id: number;
  name: string;
  created?: boolean;
}

export interface CreateTeacherPayload {
  username: string;
  email: string;
  password: string;
  department_id: number;
}

export interface CreateTeacherResponse {
  user_id: number;
  teacher_id: number;
  institution_id: number;
  department_id: number;
  role: 'teacher';
}

export interface CreateStudentPayload {
  username: string;
  email: string;
  password: string;
  department_id: number;
}

export interface CreateStudentResponse {
  user_id: number;
  student_id: number;
  institution_id: number;
  department_id: number;
  role: 'student';
}

export interface InstitutionSearchUser {
  id: number;
  username: string;
  email: string;
  name?: string;
  role: string | string[];
}

export interface AddExistingTeacherPayload {
  teacher_user_id: number;
  department_id: number;
}

export interface AddExistingStudentPayload {
  student_user_id: number;
  department_id: number;
}

export interface UpdateTeacherDepartmentPayload {
  teacher_id: number;
  department_id: number;
}

export interface RemoveTeacherPayload {
  teacher_id: number;
}

export interface UpdateStudentDepartmentPayload {
  student_id: number;
  department_id: number;
}

export interface RemoveStudentPayload {
  student_id: number;
}

export interface TrueSubject {
  id: number;
  name: string;
  code: string;
}

export interface SetInstitutionSubjectPayload {
  true_subject_id: number;
  semester: number;
  department_id: number;
  teacher_id: number;
}

export interface SetInstitutionSubjectResponse {
  id: number;
  true_subject_id: number;
  name: string;
  code: string;
  semester: number;
  department_id: number;
  teacher_id: number;
}

export interface InstitutionSubject {
  id: number;
  true_subject_id: number;
  name: string;
  code: string;
  semester: number;
  department_id: number;
  teacher_id: number;
  department_name?: string;
  teacher_name?: string;
  teacher_email?: string;
}

export interface GetInstitutionSubjectsParams {
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface InstitutionSubjectsListResponse {
  subjects: InstitutionSubject[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface AddInstitutionSubjectPayload {
  true_subject_id: number;
  semester: number;
  department_id: number;
  teacher_id: number;
}

export interface ReassignInstitutionSubjectPayload {
  subject_id: number;
  teacher_id: number;
}

export interface RemoveInstitutionSubjectPayload {
  subject_id: number;
}

export class InstitutionApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'InstitutionApiError';
  }
}
