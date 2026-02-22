import { Component, OnInit, HostListener } from '@angular/core';

interface Subject {
    name: string;
    marks: number | null;
}

interface Semester {
    id: number;
    name: string;
    subjects: Subject[];
}

const AVATAR_COLORS = [
    'linear-gradient(135deg,#667eea,#764ba2)',
    'linear-gradient(135deg,#f093fb,#f5576c)',
    'linear-gradient(135deg,#4facfe,#00f2fe)',
    'linear-gradient(135deg,#43e97b,#38f9d7)',
    'linear-gradient(135deg,#fa709a,#fee140)',
];

@Component({
    selector: 'app-semester-view',
    standalone: false,
    templateUrl: './semester-view.html',
    styleUrls: ['./semester-view.css']
})
export class SemesterViewComponent implements OnInit {
    semesters: Semester[] = [];
    selectedSemesterId: number = 1;
    dropdownOpen = false;

    ngOnInit(): void {
        this.generateMockData();
    }

    generateMockData() {
        const subjectNames = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English'];
        for (let i = 1; i <= 8; i++) {
            this.semesters.push({
                id: i,
                name: `Semester ${i}`,
                subjects: subjectNames.map(name => ({
                    name: `${name} - Sem ${i}`,
                    marks: Math.floor(Math.random() * (100 - 40 + 1)) + 40
                }))
            });
        }
    }

    get selectedSemester(): Semester | undefined {
        return this.semesters.find(s => s.id === Number(this.selectedSemesterId));
    }

    get passCount(): number {
        return this.selectedSemester?.subjects.filter(s => s.marks !== null && s.marks >= 50).length ?? 0;
    }

    toggleDropdown() {
        this.dropdownOpen = !this.dropdownOpen;
    }

    selectSemester(sem: Semester) {
        this.selectedSemesterId = sem.id;
        this.dropdownOpen = false;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.custom-dropdown-wrapper')) {
            this.dropdownOpen = false;
        }
    }

    avatarColor(index: number): string {
        return AVATAR_COLORS[index % AVATAR_COLORS.length];
    }

    semesterLabel(id: number): string {
        return id <= 2 ? '1st Year' : id <= 4 ? '2nd Year' : id <= 6 ? '3rd Year' : '4th Year';
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
