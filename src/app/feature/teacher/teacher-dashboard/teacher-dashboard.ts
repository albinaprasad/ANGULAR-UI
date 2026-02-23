import { Component, OnInit } from '@angular/core';

interface Student {
    id: string;
    name: string;
    rollNo: string;
    answerSheetUploaded: boolean;
    score?: number | null;
    status: 'Pending' | 'Uploaded' | 'Graded';
    marksBySemester?: any[]; // optional, if we want to expand table
}

@Component({
    selector: 'app-teacher-dashboard',
    standalone: false,
    templateUrl: './teacher-dashboard.html',
    styleUrls: ['./teacher-dashboard.css']
})
export class TeacherDashboardComponent implements OnInit {

    // State
    showAddStudentModal = false;
    isDropdownOpen = false;
    newStudentData = { name: '', rollNo: '' };

    // Select options
    semesterOptions = [
        { label: 'Semester 1', value: 'Semester 1' },
        { label: 'Semester 2', value: 'Semester 2' },
        { label: 'Semester 3', value: 'Semester 3' },
        { label: 'Semester 4', value: 'Semester 4' },
        { label: 'Semester 5', value: 'Semester 5' },
        { label: 'Semester 6', value: 'Semester 6' },
        { label: 'Semester 7', value: 'Semester 7' },
        { label: 'Semester 8', value: 'Semester 8' }
    ];
    selectedBatch = 'Semester 1';

    students: Student[] = [
        { id: '1', name: 'Albin Prasad', rollNo: 'CS001', answerSheetUploaded: false, status: 'Pending' },
        { id: '2', name: 'John Doe', rollNo: 'CS002', answerSheetUploaded: true, status: 'Uploaded', score: null },
        { id: '3', name: 'Jane Smith', rollNo: 'CS003', answerSheetUploaded: true, status: 'Graded', score: 85 }
    ];

    constructor() { }

    ngOnInit(): void {
    }

    // Handlers
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
                // Mocking a file upload
                console.log(`Uploaded file ${file.name} for ${student.name}`);
            }
        };
        input.click();
    }

    sendToAI(student: Student) {
        if (!student.answerSheetUploaded) return;

        student.status = 'Pending'; // Show loading or processing state
        // Mock processing timeout
        setTimeout(() => {
            student.status = 'Graded';
            student.score = Math.floor(Math.random() * (100 - 60 + 1) + 60); // Random score 60-100
        }, 2000);
    }
}
