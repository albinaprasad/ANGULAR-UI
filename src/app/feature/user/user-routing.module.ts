import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { Profile } from "./profile/profile";
import { NotificationComponent } from "./notification/notification";
import { SemesterViewComponent } from "./semester-view/semester-view";

const routes: Routes = [
    {
        path: 'profile',
        component: Profile
    },
    {
        path: 'nofication',
        redirectTo: 'notification',
        pathMatch: 'full'
    },
    {
        path: 'notification',
        component: NotificationComponent
    },
    {
        path: 'semesters',
        component: SemesterViewComponent
    },
    {
        path: '',
        redirectTo: 'semesters',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: '/error'
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CustomerRoutingModule { }
