import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { Panel } from './feature/admin/components/panel/panel';
import { ErrorPageComponent } from './feature/error/error-page/error-page';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./feature/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '',
    component: Panel,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'admin',
        loadChildren: () => import('./feature/admin/admin-module').then(m => m.AdminModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'institution',
        loadChildren: () => import('./feature/institution/institution.module').then(m => m.InstitutionModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'teacher',
        loadChildren: () => import('./feature/teacher/teacher.module').then(m => m.TeacherModule)
      },
      {
        path: 'user',
        loadChildren: () => import('./feature/user/user-module').then(m => m.CustomerModule)
      }
    ],
  },
  {
    path: 'error',
    component: ErrorPageComponent
  },
  {
    path: '**',
    redirectTo: 'error'
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
  constructor() { }
}
