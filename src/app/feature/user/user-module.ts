import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { CustomerRoutingModule } from './user-routing.module';
import { Profile } from './profile/profile';
import { NotificationComponent } from './notification/notification';
import { SemesterViewComponent } from './semester-view/semester-view';

@NgModule({
  declarations: [
    Profile,
    NotificationComponent,
    SemesterViewComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CustomerRoutingModule
  ]
})
export class CustomerModule { }
