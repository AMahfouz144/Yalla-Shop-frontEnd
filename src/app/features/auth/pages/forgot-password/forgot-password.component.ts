import { Component } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.forgotForm = this.fb.group({
      userName: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;
    this.submitSuccess = null;

    const reqData = this.forgotForm.value;

    this.authService.ForgetPassword(reqData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.isSuccess || res.isSuccess === undefined) {
          // Sometimes success comes through message
          this.submitSuccess = res.message || 'If an account with that email exists, we have sent a reset password link.';
          this.forgotForm.reset();
        } else {
          this.submitError = res.message || 'Failed to send request.';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        // The API might throw an error or just return a string message. Handle both gracefully.
        this.submitError = err.error?.message || err.error?.Message || 'Something went wrong. Please try again later.';
      }
    });
  }
}
