import { Component, OnInit, HostListener } from '@angular/core';
import { InstitutionService } from '../../../services/institution.service';
import { AuthService } from '../../../services/http/auth.service';

interface Subject {
    name: string;
    marks: number | null;
}

interface Semester {
    id: number;
    name: string;
    subjects: Subject[];
}

interface Student {
    id: string;
    name: string;
    rollNo: string;
    answerSheetUploaded: boolean;
    score?: number | null;
    status: 'Pending' | 'Uploaded' | 'Graded';
}

@Component({
    selector: 'app-teacher-dashboard',
    standalone: false,
    templateUrl: './teacher-dashboard.html',
    styleUrls: ['./teacher-dashboard.css']
})
export class TeacherDashboardComponent implements OnInit {

    // Main Selection State
    semesters: Semester[] = [];
    selectedSemesterId: number = 1;
    semesterDropdownOpen = false;

    selectedSubjectName: string = '';
    subjectDropdownOpen = false;

    // Student Data
    students: Student[] = [];

    // Modal State
    showAddStudentModal = false;
    newStudentData = { name: '', rollNo: '' };

    constructor(
        private institutionService: InstitutionService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadSemestersFromService();
        if (this.semesters.length > 0) {
            this.selectedSemesterId = this.semesters[0].id;
            this.selectedSubjectName = this.semesters[0].subjects[0]?.name || '';
        }
        this.generateMockStudents();
    }

    // --- Load data from InstitutionService or fallback to mock ---
    loadSemestersFromService(): void {
        const currentUser = this.authService.getUser();
        const teacherName = currentUser?.username || '';

        // Try to load from InstitutionService (teacher assignments)
        const assigned = this.institutionService.getTeacherSemestersAndSubjects(teacherName);

        if (assigned.length > 0) {
            this.semesters = assigned.map(a => ({
                id: a.semester.id,
                name: a.semester.name,
                subjects: a.subjects.map(s => ({ name: s.name, marks: null }))
            }));
        } else {
            // Fallback to mock data if no assignments exist
            this.generateMockSemesters();
        }
    }

    // --- Mock Data (fallback) ---
    generateMockSemesters() {
        const subjectNames = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English'];
        for (let i = 1; i <= 8; i++) {
            this.semesters.push({
                id: i,
                name: `Semester ${i}`,
                subjects: subjectNames.map(name => ({
                    name: `${name} - Sem ${i}`,
                    marks: null
                }))
            });
        }
    }

    generateMockStudents() {
        const names = ['Albin Prasad', 'John Doe', 'Jane Smith', 'Michael Johnson', 'Sarah Williams', 'David Brown'];
        this.students = names.map((name, index) => {
            const uploaded = Math.random() > 0.3;
            const graded = uploaded && Math.random() > 0.4;
            return {
                id: `${index + 1}`,
                name: name,
                rollNo: `CS00${index + 1}`,
                answerSheetUploaded: uploaded,
                status: graded ? 'Graded' : (uploaded ? 'Uploaded' : 'Pending'),
                score: graded ? Math.floor(Math.random() * (100 - 60 + 1) + 60) : null
            };
        });
    }

    // --- Semester Dropdown Logic ---
    get selectedSemester(): Semester | undefined {
        return this.semesters.find(s => s.id === Number(this.selectedSemesterId));
    }

    toggleSemesterDropdown(event: Event) {
        event.stopPropagation();
        this.semesterDropdownOpen = !this.semesterDropdownOpen;
        this.subjectDropdownOpen = false;
    }

    selectSemester(sem: Semester) {
        this.selectedSemesterId = sem.id;
        this.selectedSubjectName = sem.subjects[0]?.name || ''; // Default to first
        this.semesterDropdownOpen = false;
        this.generateMockStudents();
    }

    semesterLabel(id: number): string {
        return id <= 2 ? '1st Year' : id <= 4 ? '2nd Year' : id <= 6 ? '3rd Year' : '4th Year';
    }

    // --- Subject Dropdown Logic ---
    get currentSubjects(): Subject[] {
        return this.selectedSemester?.subjects || [];
    }

    toggleSubjectDropdown(event: Event) {
        event.stopPropagation();
        this.subjectDropdownOpen = !this.subjectDropdownOpen;
        this.semesterDropdownOpen = false;
    }

    selectSubject(sub: Subject) {
        this.selectedSubjectName = sub.name;
        this.subjectDropdownOpen = false;
        this.generateMockStudents(); // Simulate fetching matching students
    }

    // --- Click Outside ---
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.custom-dropdown-wrapper')) {
            this.semesterDropdownOpen = false;
            this.subjectDropdownOpen = false;
        }
    }

    // --- Student Actions ---
    openAddStudentModal() {
        this.showAddStudentModal = true;
        this.newStudentData = { name: '', rollNo: '' };
    }

    closeAddStudentModal() {
        this.showAddStudentModal = false;
    }

    addStudent() {
        if (!this.newStudentData.name || !this.newStudentData.rollNo) return;
        this.students.push({
            id: Math.random().toString(),
            name: this.newStudentData.name,
            rollNo: this.newStudentData.rollNo,
            answerSheetUploaded: false,
            status: 'Pending'
        });
        this.closeAddStudentModal();
    }

    triggerFileUpload(student: Student) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/pdf,image/*';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (file) {
                student.answerSheetUploaded = true;
                student.status = 'Uploaded';
            }
        };
        input.click();
    }

    sendToAI(student: Student) {
        if (!student.answerSheetUploaded) return;

        student.status = 'Pending';
        setTimeout(() => {
            student.status = 'Graded';
            student.score = Math.floor(Math.random() * (100 - 60 + 1) + 60);
        }, 1500);
    }
}

