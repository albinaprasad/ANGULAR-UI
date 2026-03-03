import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { TeacherRoutingModule } from './teacher-routing.module';
import { TeacherDashboardComponent } from './components/dashboard/dashboard';
import { TeacherAssignFormComponent } from './components/teacher-assign-form/teacher-assign-form';


@NgModule({
  declarations: [TeacherDashboardComponent, TeacherAssignFormComponent],
  imports: [
    CommonModule,
    SharedModule,
    TeacherRoutingModule
  ]
})
export class TeacherModule { }
