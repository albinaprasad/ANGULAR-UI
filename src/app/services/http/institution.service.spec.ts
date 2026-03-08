import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InstitutionService } from './institution.service';
import { InstitutionApiError } from '../../types/institution.types';

describe('InstitutionService', () => {
  let service: InstitutionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InstitutionService],
    });

    service = TestBed.inject(InstitutionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call add subject endpoint for subject creation', () => {
    const payload = { true_subject_id: 3, semester: 5, department_id: 1, teacher_id: 5 };

    service.addInstitutionSubject(payload).subscribe((response) => {
      expect(response.id).toBe(21);
      expect(response.code).toBe('MATH101');
    });

    const request = httpMock.expectOne((req) => req.url.endsWith('/core/institution/subjects/add'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({
      message: {
        id: 21,
        true_subject_id: 3,
        name: 'Mathematics',
        code: 'MATH101',
        semester: 5,
        department_id: 1,
        teacher_id: 5,
      },
    });
  });

  it('should parse paginated subjects response', () => {
    service.getInstitutionSubjects({ q: 'math', page: 2, pageSize: 20 }).subscribe((response) => {
      expect(response.page).toBe(2);
      expect(response.pageSize).toBe(20);
      expect(response.total).toBe(33);
      expect(response.hasMore).toBe(true);
      expect(response.subjects.length).toBe(1);
      expect(response.subjects[0].teacher_id).toBe(8);
    });

    const request = httpMock.expectOne((req) => req.url.endsWith('/core/institution/subjects'));
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('q')).toBe('math');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('page_size')).toBe('20');

    request.flush({
      message: {
        subjects: [
          {
            id: 21,
            true_subject_id: 3,
            name: 'Mathematics',
            code: 'MATH101',
            semester: 5,
            department_id: 1,
            teacher_id: 8,
          },
        ],
        page: 2,
        page_size: 20,
        total: 33,
        has_more: true,
      },
    });
  });

  it('should surface backend conflict message for 409', () => {
    service.removeTeacher({ teacher_id: 5 }).subscribe({
      next: () => {
        throw new Error('Expected error response');
      },
      error: (error: InstitutionApiError) => {
        expect(error instanceof InstitutionApiError).toBe(true);
        expect(error.status).toBe(409);
        expect(error.message).toBe('Teacher has assigned subjects and cannot be removed.');
      },
    });

    const request = httpMock.expectOne((req) => req.url.endsWith('/core/institution/teachers/remove'));
    expect(request.request.method).toBe('POST');

    request.flush(
      { error: 'Teacher has assigned subjects and cannot be removed.' },
      { status: 409, statusText: 'Conflict' }
    );
  });
});
