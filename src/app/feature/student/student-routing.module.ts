import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentDashboardComponent } from './components/dashboard/dashboard';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: StudentDashboardComponent
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
export class StudentRoutingModule {}
