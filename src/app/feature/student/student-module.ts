import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { StudentRoutingModule } from './student-routing.module';
import { StudentDashboardComponent } from './components/dashboard/dashboard';
import { StudentMarksTableComponent } from './components/student-marks-table/student-marks-table';

@NgModule({
  declarations: [StudentDashboardComponent, StudentMarksTableComponent],
  imports: [
    CommonModule,
    SharedModule,
    StudentRoutingModule
  ]
})
export class StudentModule { }
