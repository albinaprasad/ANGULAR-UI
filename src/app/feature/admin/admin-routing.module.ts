import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { Panel } from './components/panel/panel';
import { AdminGuard } from '../../guards/admin.guard';
import { PermissionsComponent } from './components/permissions/permissions';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'permissions',
        component: PermissionsComponent,
        canActivate: [AdminGuard]
      },
      {
        path: 'dashboard',
        component: Dashboard
      },
      {
        path: 'profile',
        redirectTo: '/user/profile',
        pathMatch: 'full'
      },
      {
        path: 'notification',
        redirectTo: '/user/notification',
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
export class AdminRoutingModule { }
