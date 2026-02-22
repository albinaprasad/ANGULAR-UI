import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dashboard } from './components/dashboard/dashboard';
import { SharedModule } from '../../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { Panel } from './components/panel/panel';
import { PermissionsComponent } from './components/permissions/permissions';

@NgModule({
  declarations: [Dashboard, Panel, PermissionsComponent],
  imports: [
    CommonModule,
    SharedModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
