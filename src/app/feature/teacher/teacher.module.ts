import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { TeacherRoutingModule } from './teacher-routing.module';
import { TeacherDashboardComponent } from './teacher-dashboard/teacher-dashboard';
import { TeacherMarksComponent } from './teacher-marks/teacher-marks';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [TeacherDashboardComponent, TeacherMarksComponent],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        TeacherRoutingModule
    ]
})
export class TeacherModule { }
