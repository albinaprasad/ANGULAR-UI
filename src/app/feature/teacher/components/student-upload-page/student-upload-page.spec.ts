import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap, ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { RoleDashboardService } from '../../../../services/http/role-dashboard.service';
import { SnackbarService } from '../../../../services/modal/snackbar.service';
import { StudentUploadPageComponent } from './student-upload-page';
import {
  TeacherAnswerKeyUploadResponse,
  TeacherOwnedSubject,
  TeacherPdfUploadResponse,
} from '../../../../types/role-dashboard.types';

describe('StudentUploadPageComponent', () => {
  let component: StudentUploadPageComponent;
  let fixture: ComponentFixture<StudentUploadPageComponent>;
  let roleDashboardService: jasmine.SpyObj<RoleDashboardService>;
  let snackbarService: jasmine.SpyObj<SnackbarService>;
  let router: jasmine.SpyObj<Router>;

  const paramMap$ = new BehaviorSubject(convertToParamMap({ studentId: '1' }));
  const queryParamMap$ = new BehaviorSubject(
    convertToParamMap({ username: 'student1', email: 'student1@gmail.com' })
  );

  beforeEach(async () => {
    roleDashboardService = jasmine.createSpyObj<RoleDashboardService>('RoleDashboardService', [
      'getTeacherSubjects',
      'uploadTeacherPdf',
      'uploadTeacherSubjectAnswerKey',
      'getErrorMessage',
    ]);
    snackbarService = jasmine.createSpyObj<SnackbarService>('SnackbarService', ['success']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [StudentUploadPageComponent],
      providers: [
        { provide: RoleDashboardService, useValue: roleDashboardService },
        { provide: SnackbarService, useValue: snackbarService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMap$.asObservable(),
            queryParamMap: queryParamMap$.asObservable(),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    const subjects: TeacherOwnedSubject[] = [
      { subject_id: 10, subject_name: 'Maths', subject_code: 'MTH101' },
    ];
    roleDashboardService.getTeacherSubjects.and.returnValue(of(subjects));

    fixture = TestBed.createComponent(StudentUploadPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('uploads PDF successfully and shows returned file info', () => {
    const file = new File(['pdf-data'], 'marks.pdf', { type: 'application/pdf' });
    const response: TeacherPdfUploadResponse = {
      id: 10,
      teacher_user_id: 4,
      original_filename: 'marks.pdf',
      stored_filename: 'stored-marks.pdf',
      file_path: '/tmp/stored-marks.pdf',
      file_url: 'https://cdn.example.com/stored-marks.pdf',
    };
    component.selectedFile = file;
    roleDashboardService.uploadTeacherPdf.and.returnValue(of(response));

    component.submitUpload();

    expect(roleDashboardService.uploadTeacherPdf).toHaveBeenCalledWith(file);
    expect(component.successMessage).toBe('PDF uploaded successfully.');
    expect(component.uploadedFileName).toBe('marks.pdf');
    expect(component.uploadedFileUrl).toBe('https://cdn.example.com/stored-marks.pdf');
    expect(component.selectedFile).toBeNull();
    expect(snackbarService.success).toHaveBeenCalledWith('PDF uploaded successfully.', 3500);
  });

  it('shows backend message for 400 upload errors', () => {
    component.selectedFile = new File(['pdf-data'], 'bad.pdf', { type: 'application/pdf' });
    roleDashboardService.uploadTeacherPdf.and.returnValue(
      throwError(() => ({ status: 400, friendlyMessage: 'Invalid PDF structure.' }))
    );

    component.submitUpload();

    expect(component.errorMessage).toBe('Invalid PDF structure.');
  });

  it('shows login required on 401', () => {
    component.selectedFile = new File(['pdf-data'], 'secure.pdf', { type: 'application/pdf' });
    roleDashboardService.uploadTeacherPdf.and.returnValue(
      throwError(() => ({ status: 401 }))
    );

    component.submitUpload();

    expect(component.errorMessage).toBe('Login required');
  });

  it('shows teacher role required on 403', () => {
    component.selectedFile = new File(['pdf-data'], 'secure.pdf', { type: 'application/pdf' });
    roleDashboardService.uploadTeacherPdf.and.returnValue(
      throwError(() => ({ status: 403 }))
    );

    component.submitUpload();

    expect(component.errorMessage).toBe('Teacher role required');
  });

  it('requires subject selection for answer-key upload', () => {
    component.uploadType = 'answerKey';
    component.selectedSubjectId = null;
    component.selectedFile = new File(['pdf-data'], 'answer.pdf', { type: 'application/pdf' });

    component.submitUpload();

    expect(component.errorMessage).toBe('Please select a subject for answer key upload.');
    expect(roleDashboardService.uploadTeacherSubjectAnswerKey).not.toHaveBeenCalled();
  });

  it('uploads answer-key PDF successfully', () => {
    const file = new File(['pdf-data'], 'answer-key.pdf', { type: 'application/pdf' });
    const response: TeacherAnswerKeyUploadResponse = {
      id: 7,
      teacher_user_id: 2,
      subject_id: 10,
      original_filename: 'answer-key.pdf',
      stored_filename: 'stored-answer-key.pdf',
      file_path: '/tmp/stored-answer-key.pdf',
      file_url: 'https://cdn.example.com/stored-answer-key.pdf',
    };
    component.uploadType = 'answerKey';
    component.selectedSubjectId = 10;
    component.selectedFile = file;
    roleDashboardService.uploadTeacherSubjectAnswerKey.and.returnValue(of(response));

    component.submitUpload();

    expect(roleDashboardService.uploadTeacherSubjectAnswerKey).toHaveBeenCalledWith(10, file);
    expect(component.successMessage).toBe('PDF uploaded successfully.');
    expect(component.uploadedFileName).toBe('answer-key.pdf');
  });

  it('shows duplicate answer-key message on 409', () => {
    component.uploadType = 'answerKey';
    component.selectedSubjectId = 10;
    component.selectedFile = new File(['pdf-data'], 'answer-key.pdf', { type: 'application/pdf' });
    roleDashboardService.uploadTeacherSubjectAnswerKey.and.returnValue(
      throwError(() => ({ status: 409 }))
    );

    component.submitUpload();

    expect(component.errorMessage).toBe('Answer key already uploaded for this subject');
  });

  it('shows own-subject permission message on 403 for answer-key upload', () => {
    component.uploadType = 'answerKey';
    component.selectedSubjectId = 10;
    component.selectedFile = new File(['pdf-data'], 'answer-key.pdf', { type: 'application/pdf' });
    roleDashboardService.uploadTeacherSubjectAnswerKey.and.returnValue(
      throwError(() => ({ status: 403, friendlyMessage: 'You can upload only for your own subject.' }))
    );

    component.submitUpload();

    expect(component.errorMessage).toBe('You can upload only for your own subject');
  });

  it('shows generic upload failed message for unknown errors', () => {
    component.selectedFile = new File(['pdf-data'], 'secure.pdf', { type: 'application/pdf' });
    roleDashboardService.uploadTeacherPdf.and.returnValue(
      throwError(() => ({ status: 500 }))
    );

    component.submitUpload();

    expect(component.errorMessage).toBe('Upload failed. Please try again.');
  });
});
