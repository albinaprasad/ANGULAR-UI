export type MemberRole = 'teacher' | 'student';

export interface InstitutionMember {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  department_name: string;
}

export interface GetMembersParams {
  role?: MemberRole;
  q?: string;
  pageSize?: number;
  page?: number;
  offset?: number;
}

export interface MembersPaginationMeta {
  offset: number;
  page: number;
  page_size: number;
}

export interface MembersNormalizedResponse {
  teachers: InstitutionMember[];
  students: InstitutionMember[];
  teacherCount: number;
  studentCount: number;
  teacherTotal: number;
  studentTotal: number;
  teacherHasMore: boolean;
  studentHasMore: boolean;
  meta: MembersPaginationMeta;
}

export class InstitutionMembersApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'InstitutionMembersApiError';
  }
}
