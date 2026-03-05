export type UserRole = 'institution' | 'teacher' | 'student';

export interface DashboardUser {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string | string[];
}

export interface Department {
  id: number;
  name: string;
}

export interface InstitutionTeacher {
  teacher_id: number;
  teacher_user_id: number;
  department_id: number;
  user?: DashboardUser;
}

export interface SubjectPayload {
  name: string;
  code: string;
  semester: number;
  department_id: number;
  teacher_id: number;
}

export interface StudentMark {
  subject_name: string;
  subject_code: string;
  total_mark: number;
  acquired_mark: number;
}

export interface TeacherStudent {
  id: number;
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  department_id: number;
  department_name: string;
  role: string;
}

export interface GetTeacherStudentsParams {
  q?: string;
}

export interface TeacherSubjectGroup {
  subject_id: number;
  true_subject_id: number;
  subject_name: string;
  subject_code: string;
  semester: number;
  department_id: number;
  department_name: string;
  institution_id: number;
  students: TeacherStudent[];
  student_count: number;
}

export interface TeacherStudentsGroupedResponse {
  subjects: TeacherSubjectGroup[];
  subject_count: number;
  student_count: number;
}

export interface TeacherPdfUploadResponse {
  id: number;
  teacher_user_id: number;
  original_filename: string;
  stored_filename: string;
  file_path: string;
  file_url: string;
}

export interface TeacherAnswerKeyUploadResponse extends TeacherPdfUploadResponse {
  subject_id: number;
}

export interface TeacherOwnedSubject {
  subject_id: number;
  subject_name: string;
  subject_code: string;
}
