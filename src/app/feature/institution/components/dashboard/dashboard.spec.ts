import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { InstitutionDashboardComponent } from './dashboard';
import { InstitutionService } from '../../../../services/http/institution.service';
import { InstitutionMembersService } from '../../../../services/http/institution-members.service';
import { SnackbarService } from '../../../../services/modal/snackbar.service';

describe('InstitutionDashboardComponent flows', () => {
  let fixture: ComponentFixture<InstitutionDashboardComponent>;
  let component: InstitutionDashboardComponent;

  const institutionService = {
    getDepartments: vi.fn(() => of([{ id: 1, name: 'CSE' }])),
    updateDepartment: vi.fn(() => of({})),
    removeDepartment: vi.fn(() => of({})),
    getInstitutionSubjects: vi.fn(() => of({ subjects: [], page: 1, pageSize: 20, total: 0, hasMore: false })),
    reassignSubjectTeacher: vi.fn(() => of({})),
    removeInstitutionSubject: vi.fn(() => of({})),
  };

  const membersService = {
    getMembers: vi.fn(() => of({
      teachers: [{ id: 5, teacher_id: 5, username: 't1', email: 't1@x.com', first_name: 'T', last_name: 'One', department_name: 'CSE' }],
      students: [],
      teacherCount: 1,
      studentCount: 0,
      teacherTotal: 1,
      studentTotal: 0,
      teacherHasMore: false,
      studentHasMore: false,
      meta: { offset: 0, page: 1, page_size: 20 },
    })),
  };

  const snackbarService = {
    success: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [InstitutionDashboardComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: InstitutionService, useValue: institutionService },
        { provide: InstitutionMembersService, useValue: membersService },
        { provide: SnackbarService, useValue: snackbarService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InstitutionDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('departments flow: rename department should call update endpoint', () => {
    const department = { id: 1, name: 'CSE' };
    component.startRenameDepartment(department);
    component.editingDepartmentName = 'Computer Science';

    component.saveDepartmentName(department);

    expect(institutionService.updateDepartment).toHaveBeenCalledWith({ department_id: 1, name: 'Computer Science' });
    expect(snackbarService.success).toHaveBeenCalled();
  });

  it('subjects flow: reassign and remove should call subject endpoints', () => {
    const subject = {
      id: 21,
      true_subject_id: 3,
      name: 'Mathematics',
      code: 'MATH101',
      semester: 5,
      department_id: 1,
      teacher_id: 5,
    };

    component.subjectTeacherDraft[21] = 8;
    component.reassignSubjectTeacher(subject);
    component.removeSubject(subject);

    expect(institutionService.reassignSubjectTeacher).toHaveBeenCalledWith({ subject_id: 21, teacher_id: 8 });
    expect(institutionService.removeInstitutionSubject).toHaveBeenCalledWith({ subject_id: 21 });
  });
});
