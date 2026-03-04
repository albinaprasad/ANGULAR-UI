import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { InstitutionRoutingModule } from './institution-routing.module';
import { InstitutionDashboardComponent } from './components/dashboard/dashboard';
import { SearchUsersComponent } from './components/search-users/search-users';
import { DepartmentFormComponent } from './components/department-form/department-form';
import { MemberAssignFormComponent } from './components/member-assign-form/member-assign-form';
import { SubjectFormComponent } from './components/subject-form/subject-form';
import { CreateDepartmentModalComponent } from './components/create-department-modal/create-department-modal';
import { CreateTeacherModalComponent } from './components/create-teacher-modal/create-teacher-modal';
import { CreateStudentModalComponent } from './components/create-student-modal/create-student-modal';
import { InstitutionMembersComponent } from './components/members/members';
import { CreateSubjectMappingModalComponent } from './components/create-subject-mapping-modal/create-subject-mapping-modal';


@NgModule({
  declarations: [
    InstitutionDashboardComponent,
    SearchUsersComponent,
    DepartmentFormComponent,
    MemberAssignFormComponent,
    SubjectFormComponent,
    CreateDepartmentModalComponent,
    CreateTeacherModalComponent,
    CreateStudentModalComponent,
    InstitutionMembersComponent,
    CreateSubjectMappingModalComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    InstitutionRoutingModule
  ]
})
export class InstitutionModule { }
