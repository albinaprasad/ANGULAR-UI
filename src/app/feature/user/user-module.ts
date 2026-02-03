import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { CustomerRoutingModule } from './user-routing.module';
import { Profile } from './profile/profile';
import { Notification } from './notification/notification';

@NgModule({
  declarations: [
    Profile,
    Notification
  ],
  imports: [
    CommonModule,
    SharedModule,
    CustomerRoutingModule
  ]
})
export class CustomerModule {}
