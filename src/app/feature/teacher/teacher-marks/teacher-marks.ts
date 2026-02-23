import { Component, OnInit, HostListener } from '@angular/core';

interface Subject {
    name: string;
    marks: number | null; // Used for mocking students
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
    marks: number | null;
}

const AVATAR_COLORS = [
    'linear-gradient(135deg,#667eea,#764ba2)',
    'linear-gradient(135deg,#f093fb,#f5576c)',
    'linear-gradient(135deg,#4facfe,#00f2fe)',
    'linear-gradient(135deg,#43e97b,#38f9d7)',
    'linear-gradient(135deg,#fa709a,#fee140)',
];

@Component({
    selector: 'app-teacher-marks',
    standalone: false,
    templateUrl: './teacher-marks.html',
    styleUrls: ['./teacher-marks.css']
})
export class TeacherMarksComponent implements OnInit {

    // Semester Selection
    semesters: Semester[] = [];
    selectedSemesterId: number = 1;
    semesterDropdownOpen = false;

    // Subject Selection
    selectedSubjectName: string = '';
    subjectDropdownOpen = false;

    // Student Data Mock (Based on Selected Sem + Subject)
    students: Student[] = [];

    ngOnInit(): void {
        this.generateMockSemesters();
        this.selectedSubjectName = this.semesters[0].subjects[0].name;
        this.generateMockStudents();
    }

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
        // Mock 12 students with random marks for the selected subject
        const names = ['Albin Prasad', 'John Doe', 'Jane Smith', 'Michael Johnson', 'Sarah Williams', 'David Brown', 'Emily Davis', 'James Wilson', 'Olivia Taylor', 'Robert Anderson', 'Sophia Martinez', 'William Thomas'];

        this.students = names.map((name, index) => ({
            id: `${index + 1}`,
            name: name,
            rollNo: `CS00${index + 1}`,
            marks: Math.random() > 0.2 ? Math.floor(Math.random() * (100 - 30 + 1)) + 30 : null // 20% chance of pending/null
        }));
    }

    // --- Semester Dropdown ---
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
        this.selectedSubjectName = sem.subjects[0].name; // Default to first subject
        this.semesterDropdownOpen = false;
        this.generateMockStudents();
    }

    semesterLabel(id: number): string {
        return id <= 2 ? '1st Year' : id <= 4 ? '2nd Year' : id <= 6 ? '3rd Year' : '4th Year';
    }

    // --- Subject Dropdown ---
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
        this.generateMockStudents(); // Re-randomize to simulate fetching new subject data
    }

    // --- Click outside ---
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.custom-dropdown-wrapper')) {
            this.semesterDropdownOpen = false;
            this.subjectDropdownOpen = false;
        }
    }

    // --- Shared Logic ---
    get passCount(): number {
        return this.students.filter(s => s.marks !== null && s.marks >= 50).length;
    }

    avatarColor(index: number): string {
        return AVATAR_COLORS[index % AVATAR_COLORS.length];
    }

    letterGrade(marks: number | null): string {
        if (marks === null) return '—';
        if (marks >= 90) return 'A+';
        if (marks >= 80) return 'A';
        if (marks >= 70) return 'B+';
        if (marks >= 60) return 'B';
        if (marks >= 50) return 'C';
        return 'F';
    }

    letterClass(marks: number | null): string {
        if (!marks) return 'grade-f';
        if (marks >= 80) return 'grade-a';
        if (marks >= 60) return 'grade-b';
        if (marks >= 50) return 'grade-c';
        return 'grade-f';
    }
}
