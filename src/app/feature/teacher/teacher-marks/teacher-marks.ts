import { Component } from '@angular/core';

@Component({
    selector: 'app-teacher-marks',
    standalone: false,
    templateUrl: './teacher-marks.html',
    styleUrls: ['./teacher-marks.css']
})
export class TeacherMarksComponent {
    students = [
        { id: '1', name: 'Albin Prasad', rollNo: 'CS001' },
        { id: '2', name: 'Albin', rollNo: 'CS002' },
        { id: '3', name: 'Prasad', rollNo: 'CS003' }
    ];
}
