import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { InstitutionRoutingModule } from './institution-routing.module';
import { InstitutionComponent } from './institution';

@NgModule({
    declarations: [InstitutionComponent],
    imports: [
        CommonModule,
        SharedModule,
        InstitutionRoutingModule
    ]
})
export class InstitutionModule { }
