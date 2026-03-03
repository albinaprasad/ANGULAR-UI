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
