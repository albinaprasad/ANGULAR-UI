import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeacherDashboardComponent } from './components/dashboard/dashboard';
import { TeacherStudentsPageComponent } from './components/students-page/students-page';
import { StudentMarksPageComponent } from './components/student-marks-page/student-marks-page';
import { StudentUploadPageComponent } from './components/student-upload-page/student-upload-page';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'students',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: TeacherDashboardComponent
      },
      {
        path: 'students',
        component: TeacherStudentsPageComponent
      },
      {
        path: 'students/:studentId/marks',
        component: StudentMarksPageComponent
      },
      {
        path: 'students/:studentId/upload',
        component: StudentUploadPageComponent
      },
      {
        path: 'profile',
        redirectTo: '/user/profile',
        pathMatch: 'full'
      },
      {
        path: 'notification',
        redirectTo: '/user/notification'
      },
      {
        path: '**',
        redirectTo: '/error'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeacherRoutingModule {}
