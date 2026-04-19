import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { EmailConfirmationComponentComponent } from './pages/email-confirmation-component/email-confirmation-component.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { ConfirmChangeEmailComponent } from './pages/confirm-change-email/confirm-change-email.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    EmailConfirmationComponentComponent,
    ResetPasswordComponent,
    ConfirmChangeEmailComponent
  ],
  imports: [
    SharedModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }
