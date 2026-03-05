import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { TeacherRoutingModule } from './teacher-routing.module';
import { TeacherDashboardComponent } from './components/dashboard/dashboard';
import { TeacherAssignFormComponent } from './components/teacher-assign-form/teacher-assign-form';
import { TeacherStudentsPageComponent } from './components/students-page/students-page';
import { StudentMarksPageComponent } from './components/student-marks-page/student-marks-page';
import { StudentUploadPageComponent } from './components/student-upload-page/student-upload-page';


@NgModule({
  declarations: [
    TeacherDashboardComponent,
    TeacherAssignFormComponent,
    TeacherStudentsPageComponent,
    StudentMarksPageComponent,
    StudentUploadPageComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TeacherRoutingModule
  ]
})
export class TeacherModule { }
