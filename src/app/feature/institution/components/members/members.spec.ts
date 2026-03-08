import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { InstitutionMembersComponent } from './members';
import { InstitutionMembersService } from '../../../../services/http/institution-members.service';
import { InstitutionService } from '../../../../services/http/institution.service';
import { SnackbarService } from '../../../../services/modal/snackbar.service';

describe('InstitutionMembersComponent flows', () => {
  let fixture: ComponentFixture<InstitutionMembersComponent>;
  let component: InstitutionMembersComponent;

  const membersService = {
    getMembers: vi.fn(() => of({
      teachers: [{ id: 5, teacher_id: 5, username: 't1', email: 't1@x.com', first_name: 'Teach', last_name: 'Er', department_id: 1, department_name: 'CSE' }],
      students: [{ id: 7, student_id: 7, username: 's1', email: 's1@x.com', first_name: 'Stu', last_name: 'Dent', department_id: 1, department_name: 'CSE' }],
      teacherCount: 1,
      studentCount: 1,
      teacherTotal: 1,
      studentTotal: 1,
      teacherHasMore: false,
      studentHasMore: false,
      meta: { offset: 0, page: 1, page_size: 20 },
    })),
  };

  const institutionService = {
    getDepartments: vi.fn(() => of([{ id: 1, name: 'CSE' }, { id: 2, name: 'ECE' }])),
    searchUsers: vi.fn(() => of([{ id: 12, username: 't2', email: 't2@x.com', role: 'teacher' }])),
    addExistingTeacher: vi.fn(() => of({})),
    addExistingStudent: vi.fn(() => of({})),
    createTeacher: vi.fn(() => of({})),
    createStudent: vi.fn(() => of({})),
    updateTeacherDepartment: vi.fn(() => of({})),
    updateStudentDepartment: vi.fn(() => of({})),
    removeTeacher: vi.fn(() => of({})),
    removeStudent: vi.fn(() => of({})),
  };

  const snackbarService = {
    success: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [InstitutionMembersComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: InstitutionMembersService, useValue: membersService },
        { provide: InstitutionService, useValue: institutionService },
        { provide: SnackbarService, useValue: snackbarService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InstitutionMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('teachers flow: add existing and open create modal', () => {
    component.existingQuery = 't2';
    component.searchExistingUsers();
    component.selectExistingUser(12);
    component.onExistingDepartmentChange(1);
    component.addExistingMember();
    component.openCreateModal();
    component.onTeacherCreated();

    expect(institutionService.addExistingTeacher).toHaveBeenCalledWith({ teacher_user_id: 12, department_id: 1 });
    expect(component.showCreateTeacherModal).toBe(false);
  });

  it('students flow: update and remove student should call student endpoints', () => {
    component.switchTab('student');
    const member = component.studentState.items[0];

    component.onMemberDepartmentDraftChange(member, 'student', 2);
    component.updateMemberDepartment(member, 'student');
    component.removeMember(member, 'student');

    expect(institutionService.updateStudentDepartment).toHaveBeenCalledWith({ student_id: 7, department_id: 2 });
    expect(institutionService.removeStudent).toHaveBeenCalledWith({ student_id: 7 });
  });
});
