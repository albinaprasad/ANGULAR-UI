import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { Profile } from "./profile/profile";
import { Notification } from "./notification/notification";

const routes: Routes = [
    {
        path: 'profile',
        component: Profile
    },
    {
        path: 'notification',
        component: Notification
    },
    {
        path:'',
        redirectTo: 'profile',
        pathMatch: 'full'
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CustomerRoutingModule { }