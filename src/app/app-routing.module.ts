import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { Panel } from './feature/admin/components/panel/panel';
import { AuthService } from './services/http/auth.service';

let isAdmin = true;

const adminChildren = [
  {
    path: 'admin',
    loadChildren: () => import('./feature/admin/admin-module').then(m => m.AdminModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'user',
    loadChildren: () => import('./feature/user/user-module').then(m => m.CustomerModule),
    canActivate: [AuthGuard]
  }
];

const userChildren = [{
  
}]
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
    children: isAdmin ? adminChildren : userChildren,
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 
  constructor(private authService:AuthService) {
    isAdmin = authService.getUser()?.is_superAdmin ?? false  
  }
}
