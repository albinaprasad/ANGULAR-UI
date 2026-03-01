import { Component, OnInit, HostListener } from '@angular/core';
import { InstitutionService } from '../../services/institution.service';
import { Institution, Semester, Subject, TeacherAssignment } from '../../types/institution.types';

@Component({
    selector: 'app-institution',
    standalone: false,
    templateUrl: './institution.html',
    styleUrls: ['./institution.css']
})
export class InstitutionComponent implements OnInit {

    // ── Data ──────────────────────────────────
    institutions: Institution[] = [];
    assignments: TeacherAssignment[] = [];

    // ── Active Tab ─────────────────────────────
    activeTab: 'institutions' | 'teachers' = 'institutions';

    // ── Institution Form ──────────────────────
    newInstitution = { name: '', code: '', address: '' };

    // ── Add Teacher Modal ─────────────────────
    showAddTeacherModal = false;
    newTeacher = {
        teacherName: '',
        institutionId: null as number | null,
        semesterName: '',
        semesterNumber: 1,
        subjectName: '',
        subjectCode: ''
    };

    // ── Dropdown state ────────────────────────
    instDropdownOpen = false;

    constructor(private institutionService: InstitutionService) { }

    ngOnInit(): void {
        this.refreshAll();
    }

    refreshAll(): void {
        this.institutions = this.institutionService.getInstitutions();
        this.assignments = this.institutionService.getTeacherAssignments();
    }

    // ── Tab ───────────────────────────────────
    setTab(tab: 'institutions' | 'teachers'): void {
        this.activeTab = tab;
    }

    // ── Institution CRUD ──────────────────────
    addInstitution(): void {
        if (!this.newInstitution.name || !this.newInstitution.code) return;
        this.institutionService.createInstitution(
            this.newInstitution.name,
            this.newInstitution.code,
            this.newInstitution.address
        );
        this.newInstitution = { name: '', code: '', address: '' };
        this.refreshAll();
    }

    // ── Add Teacher Modal ─────────────────────
    openAddTeacherModal(): void {
        this.showAddTeacherModal = true;
        this.newTeacher = {
            teacherName: '',
            institutionId: null,
            semesterName: '',
            semesterNumber: 1,
            subjectName: '',
            subjectCode: ''
        };
        this.instDropdownOpen = false;
    }

    closeAddTeacherModal(): void {
        this.showAddTeacherModal = false;
    }

    toggleInstDropdown(event: Event): void {
        event.stopPropagation();
        this.instDropdownOpen = !this.instDropdownOpen;
    }

    selectInstitutionForTeacher(inst: Institution): void {
        this.newTeacher.institutionId = inst.id;
        this.instDropdownOpen = false;
    }

    getSelectedInstName(): string {
        if (!this.newTeacher.institutionId) return 'Select Institution';
        return this.institutionService.getInstitutionById(this.newTeacher.institutionId)?.name ?? '—';
    }

    get canAddTeacher(): boolean {
        return !!(
            this.newTeacher.teacherName &&
            this.newTeacher.institutionId &&
            this.newTeacher.semesterName &&
            this.newTeacher.subjectName &&
            this.newTeacher.subjectCode
        );
    }

    addTeacher(): void {
        if (!this.canAddTeacher) return;

        // Create semester if it doesn't exist yet
        const semester = this.institutionService.createSemester(
            this.newTeacher.institutionId!,
            this.newTeacher.semesterName,
            this.newTeacher.semesterNumber
        );

        // Create subject
        const subject = this.institutionService.createSubject(
            semester.id,
            this.newTeacher.subjectName,
            this.newTeacher.subjectCode
        );

        // Assign teacher
        this.institutionService.assignTeacher(
            this.newTeacher.teacherName,
            this.newTeacher.institutionId!,
            semester.id,
            subject.id
        );

        this.closeAddTeacherModal();
        this.refreshAll();
    }

    removeAssignment(id: number): void {
        this.institutionService.removeAssignment(id);
        this.refreshAll();
    }

    // ── Helpers ────────────────────────────────
    getInstitutionName(id: number): string {
        return this.institutionService.getInstitutionById(id)?.name ?? '—';
    }

    getSemesterName(id: number): string {
        return this.institutionService.getSemesterById(id)?.name ?? '—';
    }

    getSubjectName(id: number): string {
        return this.institutionService.getSubjectById(id)?.name ?? '—';
    }

    // ── Click Outside ─────────────────────────
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        if (!target.closest('.dd-wrapper')) {
            this.instDropdownOpen = false;
        }
    }
}
