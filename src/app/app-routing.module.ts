import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { Panel } from './feature/admin/components/panel/panel';

export const routes: Routes = [
  {
    path: '',
    component: Panel,
    children: [
      {
        path: 'auth',
        loadChildren: () => import('./feature/auth/auth.module').then(m => m.AuthModule)
      },
      {
        path: 'admin',
        loadChildren: () => import('./feature/admin/admin-module').then(m => m.AdminModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'user',
        loadChildren: () => import('./feature/user/user-module').then(m => m.CustomerModule),
        canActivate: [AuthGuard]
      },
      {
        path: '',
        redirectTo: 'auth',
        pathMatch: 'full'
      }
    ]
  }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
