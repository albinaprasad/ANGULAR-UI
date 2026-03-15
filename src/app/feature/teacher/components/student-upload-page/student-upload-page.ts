import { ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription, takeUntil, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { RoleDashboardService } from '../../../../services/http/role-dashboard.service';
import { SnackbarService } from '../../../../services/modal/snackbar.service';
import { EngineTaskSocketService, EngineTaskSocketState } from '../../../../services/websocket/engine-task-socket.service';
import {
  EngineSocketEvent,
  EngineStatusResponse,
  TeacherAnswerKeyUploadResponse,
  TeacherOwnedSubject,
  TeacherPdfUploadResponse,
} from '../../../../types/role-dashboard.types';

type UploadType = 'general' | 'answerKey';

@Component({
  selector: 'app-student-upload-page',
  standalone: false,
  templateUrl: './student-upload-page.html',
  styleUrl: './student-upload-page.css',
})
export class StudentUploadPageComponent implements OnInit, OnChanges, OnDestroy {
  @Input() embeddedMode = false;
  @Input() initialUploadType: UploadType | null = null;
  @Input() initialSubjectId: number | null = null;
  @Input() hideHeader = false;

  @ViewChild('studentPdfInput') studentPdfInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('answerKeyInput') answerKeyInputRef?: ElementRef<HTMLInputElement>;

  uploadType: UploadType = 'general';
  studentCoreId = 0;
  studentName = '';
  studentEmail = '';

  selectedSubjectId: number | null = null;
  teacherSubjects: TeacherOwnedSubject[] = [];

  selectedStudentPdf: File | null = null;
  selectedAnswerKeyPdf: File | null = null;
  studentPdfUploaded = false;
  answerKeyUploaded = false;

  studentPdfName = '';
  studentPdfUrl = '';
  answerKeyName = '';
  answerKeyUrl = '';

  loadingStudentUpload = false;
  loadingAnswerKeyUpload = false;
  loadingTrigger = false;
  pollingActive = false;
  pollingFailed = false;
  triggerFailed = false;
  studentUploadFailed = false;
  answerKeyUploadFailed = false;

  errorMessage = '';
  successMessage = '';
  taskId = '';
  taskStatus: EngineStatusResponse | null = null;
  latestEngineWsPath = '';
  engineSocketState: EngineTaskSocketState = 'closed';
  readonly engineStatusSteps = ['Queued', 'OCR Running', 'Scoring', 'Completed'];

  uploadStatusSteps = ['Preparing PDF', 'Uploading', 'Processing metadata', 'Upload completed'];
  currentStatusStep = -1;
  statusComplete = false;
  statusError = false;

  readonly schemaForm: FormGroup<{
    number_of_questions: FormControl<number | null>;
    questions: FormArray<FormGroup<{ max_mark: FormControl<number | null> }>>;
  }>;

  private readonly destroy$ = new Subject<void>();
  private statusTimer: ReturnType<typeof setInterval> | null = null;
  private pollingSub: Subscription | null = null;
  private readonly answerKeyStateStorageKey = 'teacher-answer-key-status';
  private destroyed = false;
  private shouldFallbackToPolling = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly roleDashboardService: RoleDashboardService,
    private readonly snackbarService: SnackbarService,
    private readonly engineTaskSocketService: EngineTaskSocketService
  ) {
    this.schemaForm = this.fb.group({
      number_of_questions: this.fb.control<number | null>(null, {
        validators: [Validators.required, Validators.min(1)],
      }),
      questions: this.fb.array<FormGroup<{ max_mark: FormControl<number | null> }>>([]),
    });
  }

  ngOnInit(): void {
    this.loadTeacherSubjects();

    if (this.embeddedMode) {
      this.applyEmbeddedContext();
    } else {
      this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
        const id = Number(params.get('studentId'));
        this.studentCoreId = Number.isFinite(id) && id > 0 ? id : 0;
        this.restoreSessionState();
      });

      this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
        this.studentName = params.get('username') ?? '';
        this.studentEmail = params.get('email') ?? '';

        const uploadType = params.get('uploadType');
        if (uploadType === 'answerKey' || uploadType === 'general') {
          this.uploadType = uploadType;
        }

        const subjectId = Number(params.get('subjectId'));
        if (Number.isFinite(subjectId) && subjectId > 0) {
          this.selectedSubjectId = subjectId;
        }
        this.syncAnswerKeyStateFromSubject();
        this.restoreSessionState();
      });
    }

    this.schemaForm.controls.number_of_questions.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((count) => {
      this.syncQuestionRows(count ?? 0);
      this.persistSessionState();
    });

    this.questionsArray.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.persistSessionState();
    });

    this.engineTaskSocketService.onEvent().pipe(takeUntil(this.destroy$)).subscribe((event) => {
      this.handleEngineSocketEvent(event);
    });

    this.engineTaskSocketService.onStateChange().pipe(takeUntil(this.destroy$)).subscribe((state) => {
      this.engineSocketState = state;
      this.requestViewUpdate();
    });

    this.engineTaskSocketService.onError().pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.fallbackToPollingIfNeeded('Realtime connection failed. Falling back to polling.');
    });

    this.engineTaskSocketService.onClose().pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.fallbackToPollingIfNeeded('Realtime connection closed. Falling back to polling.');
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.shouldFallbackToPolling = false;
    this.engineTaskSocketService.disconnect();
    this.stopStatusProgress();
    this.stopPolling();
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.embeddedMode) return;
    if (changes['initialUploadType'] || changes['initialSubjectId'] || changes['embeddedMode']) {
      this.applyEmbeddedContext();
      this.requestViewUpdate();
    }
  }

  get questionsArray(): FormArray<FormGroup<{ max_mark: FormControl<number | null> }>> {
    return this.schemaForm.controls.questions;
  }

  get marks(): number[] {
    return this.questionsArray.controls.map((group) => Number(group.controls.max_mark.value ?? 0));
  }

  get totalPossibleMarks(): number {
    return this.marks.reduce((sum, mark) => sum + mark, 0);
  }

  get isSchemaValid(): boolean {
    const questionCount = Number(this.schemaForm.controls.number_of_questions.value ?? 0);
    const countMatches = questionCount === this.questionsArray.length;
    const marksValid = this.marks.every((mark) => Number.isFinite(mark) && mark > 0);
    return this.schemaForm.valid && countMatches && marksValid && questionCount > 0;
  }

  get canTriggerEvaluation(): boolean {
    return Boolean(
      this.selectedSubjectId
      && this.studentCoreId > 0
      && this.studentPdfUploaded
      && this.answerKeyUploaded
      && this.isSchemaValid
      && !this.loadingTrigger
      && !this.pollingActive
    );
  }

  goBack(): void {
    if (this.embeddedMode) return;
    this.router.navigate(['/teacher/students']);
  }

  goToAnswerKeyUpload(): void {
    if (this.embeddedMode) return;
    this.router.navigate(['/teacher/uploads'], {
      queryParams: {
        uploadType: 'answerKey',
        subjectId: this.selectedSubjectId || null,
      },
    });
  }

  onSubjectChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement | null)?.value ?? 0);
    const previousSubjectId = this.selectedSubjectId;
    this.selectedSubjectId = Number.isFinite(value) && value > 0 ? value : null;
    if (previousSubjectId !== this.selectedSubjectId) {
      this.syncAnswerKeyStateFromSubject();
    }
    this.errorMessage = '';
    this.persistSessionState();
    this.requestViewUpdate();
  }

  onSchemaQuestionCountBlur(): void {
    const count = Number(this.schemaForm.controls.number_of_questions.value ?? 0);
    this.syncQuestionRows(count);
  }

  onStudentPdfChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const file = target?.files?.[0] ?? null;
    this.selectedStudentPdf = this.validatePdfOrNull(file);
    this.studentUploadFailed = false;
  }

  onAnswerKeyPdfChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const file = target?.files?.[0] ?? null;
    this.selectedAnswerKeyPdf = this.validatePdfOrNull(file);
    this.answerKeyUploadFailed = false;
  }

  uploadStudentPdf(): void {
    if (this.loadingStudentUpload) return;
    if (!this.selectedSubjectId || this.selectedSubjectId <= 0) {
      this.errorMessage = 'Select a subject before uploading student PDF.';
      this.snackbarService.error(this.errorMessage, 3000);
      return;
    }
    if (this.studentCoreId <= 0) {
      this.errorMessage = 'Student selection is missing. Open upload from the student list.';
      this.snackbarService.error(this.errorMessage, 3000);
      return;
    }
    if (!this.selectedStudentPdf) {
      this.errorMessage = 'Please choose a student PDF file before upload.';
      this.snackbarService.error(this.errorMessage, 3000);
      return;
    }

    this.loadingStudentUpload = true;
    this.studentUploadFailed = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.startStatusProgress();

    this.roleDashboardService
      .uploadTeacherPdf(this.selectedSubjectId, this.studentCoreId, this.selectedStudentPdf)
      .subscribe({
        next: (response: TeacherPdfUploadResponse) => {
          this.loadingStudentUpload = false;
          this.completeStatusProgress();
          this.studentPdfUploaded = true;
          this.studentPdfName = response.original_filename || response.stored_filename || '';
          this.studentPdfUrl = response.file_url || '';
          this.successMessage = 'Student PDF uploaded successfully.';
          this.selectedStudentPdf = null;
          this.resetFileInput(this.studentPdfInputRef);
          this.persistSessionState();
          this.snackbarService.success(this.successMessage, 3000);
          this.requestViewUpdate();
        },
        error: (error: { status?: number; friendlyMessage?: string }) => {
          this.loadingStudentUpload = false;
          this.studentUploadFailed = true;
          this.failStatusProgress();
          this.errorMessage = this.getApiErrorMessage(error, 'studentPdfUpload');
          this.snackbarService.error(this.errorMessage, 3500);
          this.requestViewUpdate();
        },
      });
  }

  uploadAnswerKeyPdf(): void {
    if (this.loadingAnswerKeyUpload) return;
    if (!this.selectedSubjectId || this.selectedSubjectId <= 0) {
      this.errorMessage = 'Select a subject before uploading answer key.';
      this.snackbarService.error(this.errorMessage, 3000);
      return;
    }
    if (!this.selectedAnswerKeyPdf) {
      this.errorMessage = 'Please choose an answer key PDF file before upload.';
      this.snackbarService.error(this.errorMessage, 3000);
      return;
    }

    this.loadingAnswerKeyUpload = true;
    this.answerKeyUploadFailed = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.startStatusProgress();

    this.roleDashboardService
      .uploadTeacherSubjectAnswerKey(this.selectedSubjectId, this.selectedAnswerKeyPdf)
      .subscribe({
        next: (response: TeacherAnswerKeyUploadResponse) => {
          this.loadingAnswerKeyUpload = false;
          this.completeStatusProgress();
          this.answerKeyUploaded = true;
          this.answerKeyName = response.original_filename || response.stored_filename || '';
          this.answerKeyUrl = response.file_url || '';
          this.persistAnswerKeyStateForSubject();
          this.successMessage = 'Answer key uploaded successfully.';
          this.selectedAnswerKeyPdf = null;
          this.resetFileInput(this.answerKeyInputRef);
          this.persistSessionState();
          this.snackbarService.success(this.successMessage, 3000);
          this.requestViewUpdate();
        },
        error: (error: { status?: number; friendlyMessage?: string }) => {
          this.loadingAnswerKeyUpload = false;
          this.answerKeyUploadFailed = true;
          this.failStatusProgress();
          this.errorMessage = this.getApiErrorMessage(error, 'answerKeyUpload');
          this.snackbarService.error(this.errorMessage, 3500);
          this.requestViewUpdate();
        },
      });
  }

  triggerEvaluation(): void {
    if (!this.canTriggerEvaluation || !this.selectedSubjectId) return;

    this.shouldFallbackToPolling = false;
    this.engineTaskSocketService.disconnect();
    this.stopPolling();
    this.loadingTrigger = true;
    this.triggerFailed = false;
    this.pollingFailed = false;
    this.errorMessage = '';
    this.successMessage = '';

    this.roleDashboardService
      .triggerEngine({
        subject_id: this.selectedSubjectId,
        student_id: this.studentCoreId,
        marks: this.marks,
      })
      .subscribe({
        next: (response) => {
          const taskId = String(response.task_id || '').trim();
          if (!taskId) {
            this.loadingTrigger = false;
            this.triggerFailed = true;
            this.taskId = '';
            this.taskStatus = null;
            this.latestEngineWsPath = response.ws_path || '';
            this.shouldFallbackToPolling = false;
            this.errorMessage = 'Engine trigger response missing task_id. Cannot track status.';
            this.snackbarService.error(this.errorMessage, 3500);
            this.requestViewUpdate();
            return;
          }

          this.loadingTrigger = false;
          this.taskId = taskId;
          this.taskStatus = {
            task_id: taskId,
            state: response.state || 'PENDING',
            stage: '',
            progress: 0,
            message: response.message || 'Engine task queued.',
            result: null,
            error: null,
          };
          this.latestEngineWsPath = response.ws_path || '';
          this.persistSessionState();
          this.shouldFallbackToPolling = true;
          this.startEngineTaskSocket(taskId, response.ws_path);
          this.requestViewUpdate();
        },
        error: (error: { status?: number; friendlyMessage?: string }) => {
          this.loadingTrigger = false;
          this.triggerFailed = true;
          this.errorMessage = this.getApiErrorMessage(error, 'trigger');
          this.snackbarService.error(this.errorMessage, 3500);
          this.requestViewUpdate();
        },
      });
  }

  retryStudentUpload(): void {
    if (!this.selectedStudentPdf) return;
    this.uploadStudentPdf();
  }

  retryAnswerKeyUpload(): void {
    if (!this.selectedAnswerKeyPdf) return;
    this.uploadAnswerKeyPdf();
  }

  retryTrigger(): void {
    this.triggerEvaluation();
  }

  retryPolling(): void {
    if (!this.taskId) return;
    this.engineTaskSocketService.disconnect();
    this.pollingFailed = false;
    this.startPolling(this.taskId);
  }

  get engineCurrentStep(): number {
    if (!this.taskStatus) return -1;
    const state = (this.taskStatus.state || '').toUpperCase();
    if (state === 'SUCCESS') return this.engineStatusSteps.length - 1;
    if (state === 'FAILED' || state === 'FAILURE' || state === 'ERROR') return Math.max(0, this.engineStatusSteps.length - 2);

    const progress = Number(this.taskStatus.progress ?? 0);
    if (progress <= 0) return 0;
    if (progress < 50) return 1;
    if (progress < 100) return 2;
    return this.engineStatusSteps.length - 1;
  }

  get engineComplete(): boolean {
    return (this.taskStatus?.state || '').toUpperCase() === 'SUCCESS';
  }

  get engineError(): boolean {
    const state = (this.taskStatus?.state || '').toUpperCase();
    return state === 'FAILED' || state === 'FAILURE' || state === 'ERROR';
  }

  private startPolling(taskId: string): void {
    if (!taskId) return;
    this.stopPolling();
    this.pollingActive = true;

    this.pollingSub = timer(0, 2500)
      .pipe(
        switchMap(() => this.roleDashboardService.getEngineTaskStatus(taskId)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (status) => {
          this.taskStatus = status;
          this.taskId = status.task_id || taskId;
          this.persistSessionState();

          if (this.isTerminalState(status.state)) {
            this.pollingActive = false;
            this.stopPolling();
            this.shouldFallbackToPolling = false;
            this.engineTaskSocketService.disconnect();
            if (status.state.toUpperCase() === 'SUCCESS') {
              this.successMessage = 'OCR evaluation completed successfully.';
            } else {
              this.errorMessage = status.error || status.message || 'Evaluation failed.';
              this.snackbarService.error(this.errorMessage, 3500);
            }
          }
          this.requestViewUpdate();
        },
        error: (error: { status?: number; friendlyMessage?: string }) => {
          this.pollingFailed = true;
          this.pollingActive = false;
          this.stopPolling();
          this.errorMessage = this.getApiErrorMessage(error, 'poll');
          this.snackbarService.error(this.errorMessage, 3500);
          this.requestViewUpdate();
        },
      });
  }

  private stopPolling(): void {
    if (!this.pollingSub) return;
    this.pollingSub.unsubscribe();
    this.pollingSub = null;
  }

  private startEngineTaskSocket(taskId: string, wsPath?: string): void {
    const socketPath = String(wsPath || '').trim();
    if (!socketPath) {
      this.startPolling(taskId);
      return;
    }

    const connected = this.engineTaskSocketService.connect(taskId, socketPath);
    if (!connected) {
      this.startPolling(taskId);
    }
  }

  private handleEngineSocketEvent(event: EngineSocketEvent): void {
    if (!event?.task_id || event.task_id !== this.taskId) return;

    if (event.event === 'connected') {
      if (!this.taskStatus) {
        this.taskStatus = {
          task_id: event.task_id,
          state: 'PENDING',
          stage: 'connected',
          progress: 0,
          message: event.message || 'Realtime status connected.',
          result: null,
          error: null,
        };
      } else {
        this.taskStatus = {
          ...this.taskStatus,
          state: this.taskStatus.state || 'PENDING',
          stage: this.taskStatus.stage || 'connected',
          message: event.message || this.taskStatus.message,
        };
      }
      this.persistSessionState();
      this.requestViewUpdate();
      return;
    }

    if (event.event === 'progress') {
      this.taskStatus = {
        task_id: event.task_id,
        state: 'RUNNING',
        stage: event.stage || 'running',
        progress: Number(event.progress ?? 0),
        message: event.message || 'Processing...',
        result: this.taskStatus?.result ?? null,
        error: null,
      };
      this.persistSessionState();
      this.requestViewUpdate();
      return;
    }

    if (event.event === 'success') {
      this.shouldFallbackToPolling = false;
      this.engineTaskSocketService.disconnect();
      this.stopPolling();
      this.taskStatus = {
        task_id: event.task_id,
        state: 'SUCCESS',
        stage: 'completed',
        progress: 100,
        message: 'Evaluation completed successfully.',
        result: {
          scores: event.scores ?? [],
          total_score: Number(event.total_score ?? 0),
          student_answers_count: Array.isArray(event.scores) ? event.scores.length : 0,
          teacher_answers_count: this.marks.length,
          student_mark_id: Number(event.student_mark_id ?? 0),
        },
        error: null,
      };
      this.successMessage = 'OCR evaluation completed successfully.';
      this.persistSessionState();
      this.requestViewUpdate();
      return;
    }

    if (event.event === 'failure') {
      this.shouldFallbackToPolling = false;
      this.engineTaskSocketService.disconnect();
      this.stopPolling();
      this.taskStatus = {
        task_id: event.task_id,
        state: 'FAILED',
        stage: event.stage || 'failed',
        progress: Number(event.progress ?? 100),
        message: event.message || 'Evaluation failed.',
        result: null,
        error: event.details || event.message || 'Evaluation failed.',
      };
      this.errorMessage = event.details || event.message || 'Evaluation failed.';
      this.snackbarService.error(this.errorMessage, 3500);
      this.persistSessionState();
      this.requestViewUpdate();
    }
  }

  private fallbackToPollingIfNeeded(message: string): void {
    if (!this.shouldFallbackToPolling || !this.taskId) return;
    if (this.taskStatus && this.isTerminalState(this.taskStatus.state)) return;
    if (this.pollingActive) return;

    this.startPolling(this.taskId);
    this.snackbarService.warning(message, 3000);
    this.requestViewUpdate();
  }

  private syncQuestionRows(countRaw: number): void {
    const count = Number.isFinite(countRaw) ? Math.max(0, Math.floor(countRaw)) : 0;
    while (this.questionsArray.length < count) {
      this.questionsArray.push(
        this.fb.group({
          max_mark: this.fb.control<number | null>(null, {
            validators: [Validators.required, Validators.min(0.01)],
          }),
        })
      );
    }
    while (this.questionsArray.length > count) {
      this.questionsArray.removeAt(this.questionsArray.length - 1);
    }
  }

  private validatePdfOrNull(file: File | null): File | null {
    if (!file) return null;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      this.errorMessage = 'Only PDF files are allowed.';
      this.snackbarService.error(this.errorMessage, 3000);
      return null;
    }
    this.errorMessage = '';
    return file;
  }

  private applyEmbeddedContext(): void {
    if (this.initialUploadType === 'answerKey' || this.initialUploadType === 'general') {
      this.uploadType = this.initialUploadType;
    }

    this.studentCoreId = 0;
    this.studentName = '';
    this.studentEmail = '';

    if (Number.isFinite(this.initialSubjectId) && Number(this.initialSubjectId) > 0) {
      this.selectedSubjectId = Number(this.initialSubjectId);
    } else {
      this.selectedSubjectId = null;
    }

    this.syncAnswerKeyStateFromSubject();
    this.restoreSessionState();
  }

  private loadTeacherSubjects(): void {
    this.roleDashboardService.getTeacherSubjects().pipe(takeUntil(this.destroy$)).subscribe({
      next: (subjects) => {
        this.teacherSubjects = subjects ?? [];
        this.requestViewUpdate();
      },
      error: () => {
        this.teacherSubjects = [];
        this.requestViewUpdate();
      },
    });
  }

  private getApiErrorMessage(
    error: { status?: number; friendlyMessage?: string } | null | undefined,
    action: 'studentPdfUpload' | 'answerKeyUpload' | 'trigger' | 'poll'
  ): string {
    const fallback = error?.friendlyMessage || 'Unexpected error occurred. Please try again.';
    switch (error?.status) {
      case 400:
        return error?.friendlyMessage || 'Invalid request. Check required fields and PDF file.';
      case 403:
        return error?.friendlyMessage || 'You are not authorized to perform this action.';
      case 404:
        return action === 'poll'
          ? 'Task not found. It may have expired.'
          : 'Requested subject/student resource was not found.';
      case 409:
        return action === 'answerKeyUpload'
          ? 'Answer key already uploaded for this subject.'
          : 'Conflict while processing request. Please retry.';
      case 500:
        return 'Server error occurred. Please try again shortly.';
      default:
        return fallback;
    }
  }

  private isTerminalState(state: string): boolean {
    const normalized = (state || '').toUpperCase();
    return normalized === 'SUCCESS' || normalized === 'FAILED' || normalized === 'FAILURE' || normalized === 'ERROR';
  }

  private startStatusProgress(): void {
    this.stopStatusProgress();
    this.currentStatusStep = 0;
    this.statusComplete = false;
    this.statusError = false;

    this.statusTimer = setInterval(() => {
      if (this.currentStatusStep < this.uploadStatusSteps.length - 2) {
        this.currentStatusStep += 1;
        return;
      }
      this.stopStatusProgress();
    }, 900);
  }

  private completeStatusProgress(): void {
    this.stopStatusProgress();
    this.currentStatusStep = this.uploadStatusSteps.length - 1;
    this.statusComplete = true;
    this.statusError = false;
  }

  private failStatusProgress(): void {
    this.stopStatusProgress();
    if (this.currentStatusStep < 0) this.currentStatusStep = 0;
    this.statusError = true;
    this.statusComplete = false;
  }

  private stopStatusProgress(): void {
    if (!this.statusTimer) return;
    clearInterval(this.statusTimer);
    this.statusTimer = null;
  }

  private resetFileInput(ref?: ElementRef<HTMLInputElement>): void {
    if (!ref?.nativeElement) return;
    ref.nativeElement.value = '';
  }

  private get storageKey(): string {
    return `teacher-ocr-eval:${this.studentCoreId || 0}`;
  }

  private persistSessionState(): void {
    const state = {
      subjectId: this.selectedSubjectId,
      numberOfQuestions: this.schemaForm.controls.number_of_questions.value,
      marks: this.marks,
      taskId: this.taskId,
      latestEngineWsPath: this.latestEngineWsPath,
      taskStatus: this.taskStatus,
      studentPdfUploaded: this.studentPdfUploaded,
      answerKeyUploaded: this.answerKeyUploaded,
      studentPdfName: this.studentPdfName,
      studentPdfUrl: this.studentPdfUrl,
      answerKeyName: this.answerKeyName,
      answerKeyUrl: this.answerKeyUrl,
    };
    localStorage.setItem(this.storageKey, JSON.stringify(state));
    sessionStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  private restoreSessionState(): void {
    const saved = sessionStorage.getItem(this.storageKey) || localStorage.getItem(this.storageKey);
    if (!saved) return;
    try {
      const data = JSON.parse(saved) as {
        subjectId?: number | null;
        numberOfQuestions?: number | null;
        marks?: number[];
        taskId?: string;
        latestEngineWsPath?: string;
        taskStatus?: EngineStatusResponse | null;
        studentPdfUploaded?: boolean;
        answerKeyUploaded?: boolean;
        studentPdfName?: string;
        studentPdfUrl?: string;
        answerKeyName?: string;
        answerKeyUrl?: string;
      };

      const restoredTaskId = String(data.taskId || '').trim();
      const restoredTaskStatus = data.taskStatus || null;
      const hasInProgressTask = Boolean(
        restoredTaskId &&
        restoredTaskStatus &&
        !this.isTerminalState(restoredTaskStatus.state)
      );

      if (!hasInProgressTask) {
        this.clearPersistedSessionState();
        this.resetTransientUiState();
        this.syncAnswerKeyStateFromSubject();
        return;
      }

      if (!this.selectedSubjectId && data.subjectId && data.subjectId > 0) {
        this.selectedSubjectId = data.subjectId;
      }

      const count = Number(data.numberOfQuestions ?? 0);
      if (count > 0) {
        this.schemaForm.controls.number_of_questions.setValue(count, { emitEvent: false });
        this.syncQuestionRows(count);
      }
      if (Array.isArray(data.marks) && data.marks.length === this.questionsArray.length) {
        data.marks.forEach((mark, index) => {
          this.questionsArray.at(index).controls.max_mark.setValue(Number(mark), { emitEvent: false });
        });
      }

      this.taskId = restoredTaskId;
      this.latestEngineWsPath = data.latestEngineWsPath || '';
      this.taskStatus = restoredTaskStatus;
      this.studentPdfUploaded = Boolean(data.studentPdfUploaded);
      this.answerKeyUploaded = Boolean(data.answerKeyUploaded);
      this.studentPdfName = data.studentPdfName || '';
      this.studentPdfUrl = data.studentPdfUrl || '';
      this.answerKeyName = data.answerKeyName || '';
      this.answerKeyUrl = data.answerKeyUrl || '';
      this.syncAnswerKeyStateFromSubject();

      this.shouldFallbackToPolling = true;
      this.startEngineTaskSocket(this.taskId, this.latestEngineWsPath);
    } catch {
      // Ignore broken persisted data.
    }
  }

  private syncAnswerKeyStateFromSubject(): void {
    if (!this.selectedSubjectId || this.selectedSubjectId <= 0) {
      this.answerKeyUploaded = false;
      this.answerKeyName = '';
      this.answerKeyUrl = '';
      return;
    }

    const map = this.getAnswerKeyStateMap();
    const entry = map[String(this.selectedSubjectId)];
    this.answerKeyUploaded = Boolean(entry?.uploaded);
    this.answerKeyName = entry?.fileName || '';
    this.answerKeyUrl = entry?.fileUrl || '';
  }

  private persistAnswerKeyStateForSubject(): void {
    if (!this.selectedSubjectId || this.selectedSubjectId <= 0) return;
    const map = this.getAnswerKeyStateMap();
    map[String(this.selectedSubjectId)] = {
      uploaded: true,
      fileName: this.answerKeyName,
      fileUrl: this.answerKeyUrl,
    };
    localStorage.setItem(this.answerKeyStateStorageKey, JSON.stringify(map));
    sessionStorage.setItem(this.answerKeyStateStorageKey, JSON.stringify(map));
  }

  private getAnswerKeyStateMap(): Record<string, { uploaded: boolean; fileName: string; fileUrl: string }> {
    const raw = sessionStorage.getItem(this.answerKeyStateStorageKey)
      || localStorage.getItem(this.answerKeyStateStorageKey);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<string, { uploaded: boolean; fileName: string; fileUrl: string }>;
    } catch {
      return {};
    }
  }

  private requestViewUpdate(): void {
    if (this.destroyed) return;
    this.cdr.detectChanges();
  }

  private clearPersistedSessionState(): void {
    localStorage.removeItem(this.storageKey);
    sessionStorage.removeItem(this.storageKey);
  }

  private resetTransientUiState(): void {
    this.taskId = '';
    this.latestEngineWsPath = '';
    this.taskStatus = null;
    this.studentPdfUploaded = false;
    this.studentPdfName = '';
    this.studentPdfUrl = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.schemaForm.controls.number_of_questions.setValue(null, { emitEvent: false });
    while (this.questionsArray.length > 0) {
      this.questionsArray.removeAt(this.questionsArray.length - 1);
    }
  }
}
