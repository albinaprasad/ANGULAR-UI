import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InstitutionComponent } from './institution';

export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                redirectTo: 'manage',
                pathMatch: 'full'
            },
            {
                path: 'manage',
                component: InstitutionComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InstitutionRoutingModule { }
