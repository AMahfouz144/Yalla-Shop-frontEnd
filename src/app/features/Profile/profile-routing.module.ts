import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './Pages/profile/profile.component';
import { ChangePasswordComponent } from './Pages/ChangePassword/change-password/change-password.component';

const routes: Routes = [
    { path: 'profile', component: ProfileComponent },
    { path: 'change-password', component: ChangePasswordComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProfileRoutingModule { }