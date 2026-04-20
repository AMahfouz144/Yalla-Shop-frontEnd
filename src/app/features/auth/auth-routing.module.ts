import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { EmailConfirmationComponentComponent } from './pages/email-confirmation-component/email-confirmation-component.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { ConfirmChangeEmailComponent } from './pages/confirm-change-email/confirm-change-email.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'emailConfirmation', component: EmailConfirmationComponentComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'confirm-change-email', component: ConfirmChangeEmailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
