import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dashboard } from './components/dashboard/dashboard';
import { SharedModule } from '../../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { Panel } from './components/panel/panel';

@NgModule({
  declarations: [Dashboard,Panel],
  imports: [
    CommonModule,
    SharedModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
