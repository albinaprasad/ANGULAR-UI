import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InstitutionDashboardComponent } from './components/dashboard/dashboard';
import { InstitutionMembersComponent } from './components/members/members';

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
        component: InstitutionDashboardComponent
      },
      {
        path: 'members',
        component: InstitutionMembersComponent
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
export class InstitutionRoutingModule {}
