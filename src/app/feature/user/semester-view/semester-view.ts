import { Component, OnInit } from '@angular/core';

interface Subject {
    name: string;
    marks: number | null;
}

interface Semester {
    id: number;
    name: string;
    subjects: Subject[];
}

@Component({
    selector: 'app-semester-view',
    standalone: false,
    templateUrl: './semester-view.html',
    styleUrls: ['./semester-view.css']
})
export class SemesterViewComponent implements OnInit {
    semesters: Semester[] = [];
    selectedSemesterId: number = 1;

    ngOnInit(): void {
        this.generateMockData();
    }

    generateMockData() {
        for (let i = 1; i <= 8; i++) {
            this.semesters.push({
                id: i,
                name: `Semester ${i}`,
                subjects: [
                    { name: `Subject A - Sem ${i}`, marks: Math.floor(Math.random() * (100 - 40 + 1)) + 40 },
                    { name: `Subject B - Sem ${i}`, marks: Math.floor(Math.random() * (100 - 40 + 1)) + 40 },
                    { name: `Subject C - Sem ${i}`, marks: Math.floor(Math.random() * (100 - 40 + 1)) + 40 },
                    { name: `Subject D - Sem ${i}`, marks: Math.floor(Math.random() * (100 - 40 + 1)) + 40 },
                    { name: `Subject E - Sem ${i}`, marks: Math.floor(Math.random() * (100 - 40 + 1)) + 40 },
                ]
            });
        }
    }

    get selectedSemester(): Semester | undefined {
        return this.semesters.find(s => s.id === Number(this.selectedSemesterId));
    }

    onSemesterSelect(event: any) {
        this.selectedSemesterId = event.target.value;
    }
}
