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

export interface StudentMarkRow {
  id: number;
  subject_id: number;
  subject__semester: number;
  subject__true_subject__name: string;
  subject__true_subject__code: string;
  total_mark: number;
  acquired_mark: number;
  created_at?: string;
}

export interface StudentMarksFilterParams {
  semester?: number;
  subject_id?: number;
}

export interface StudentMarkOptionSubject {
  id: number;
  true_subject_id: number;
  name: string;
  code: string;
  semester: number;
}

export interface StudentMarksOptionsPayload {
  semesters: number[];
  subjects: StudentMarkOptionSubject[];
  subject_count: number;
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
  mark_completed: boolean;
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

export interface AnswerKeyDetail {
  status: "Found" | "Not Found",
  id : number,
  subject: string,
  created_at: Date,
  answer_link: string,
  extracted_text: string,
  teacher: string
}

export interface TeacherAnswerKeyUploadResponse extends TeacherPdfUploadResponse {
  subject_id: number;
}

export interface TeacherOwnedSubject {
  subject_id: number;
  subject_name: string;
  subject_code: string;
}

export interface EngineTriggerRequest {
  subject_id: number;
  student_id: number;
  marks: number[];
}

export interface EngineTriggerResponse {
  task_id: string;
  ws_path?: string;
  subject_id?: number;
  student_id?: number;
  state?: string;
  message?: string;
}

export interface EngineResultPayload {
  scores: number[];
  total_score: number;
  student_answers_count: number;
  teacher_answers_count: number;
  student_mark_id: number;
}

export interface EngineWorkflowStep {
  key: string;
  label: string;
}

export interface EngineStatusResponse {
  task_id: string;
  state: string;
  stage: string;
  progress: number;
  message: string;
  step_key?: string | null;
  step_label?: string | null;
  step_index?: number | null;
  step_total?: number | null;
  steps?: EngineWorkflowStep[];
  result?: EngineResultPayload | null;
  error?: string | null;
}

export interface EngineSocketConnectedEvent {
  event: 'connected';
  task_id: string;
  stage?: string;
  progress?: number;
  message?: string;
  step_key?: string;
  step_label?: string;
  step_index?: number;
  step_total?: number;
  steps?: EngineWorkflowStep[];
}

export interface EngineSocketSnapshotEvent {
  event: 'snapshot';
  task_id: string;
  stage?: string;
  progress?: number;
  message?: string;
  step_key?: string;
  step_label?: string;
  step_index?: number;
  step_total?: number;
  steps?: EngineWorkflowStep[];
}

export interface EngineSocketProgressEvent {
  event: 'progress';
  task_id: string;
  stage?: string;
  progress?: number;
  message?: string;
  step_key?: string;
  step_label?: string;
  step_index?: number;
  step_total?: number;
  steps?: EngineWorkflowStep[];
}

export interface EngineSocketSuccessEvent {
  event: 'success';
  task_id: string;
  stage?: string;
  progress?: number;
  message?: string;
  step_key?: string;
  step_label?: string;
  step_index?: number;
  step_total?: number;
  steps?: EngineWorkflowStep[];
  subject_id?: number;
  student_id?: number;
  scores: number[];
  total_score: number;
  student_mark_id: number;
}

export interface EngineSocketFailureEvent {
  event: 'failure';
  task_id: string;
  stage?: string;
  progress?: number;
  message?: string;
  step_key?: string;
  step_label?: string;
  step_index?: number;
  step_total?: number;
  steps?: EngineWorkflowStep[];
  status?: number;
  details?: string;
}

export type EngineSocketEvent =
  | EngineSocketConnectedEvent
  | EngineSocketSnapshotEvent
  | EngineSocketProgressEvent
  | EngineSocketSuccessEvent
  | EngineSocketFailureEvent;
