import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  userId: string | null = null;
  code: string | null = null;
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.userId = params['userId'] || params['userid'] || params['UserId'];
      this.code = params['code'] || params['token'] || params['Code'];

      if (!this.userId || !this.code) {
        this.submitError = 'Invalid or missing password reset link parameters.';
      }
    });

    this.resetForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(7),
        Validators.maxLength(20),
        this.passwordValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.matchPasswordValidator });
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNonAlpha = /[^a-zA-Z]/.test(value);
    if (!(hasUpperCase && hasLowerCase && hasNonAlpha)) {
      return { pswdCriteria: true };
    }
    return null;
  }

  matchPasswordValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ matchPassword: true });
      return { matchPassword: true };
    } else {
      const errors = group.get('confirmPassword')?.errors;
      if (errors) {
        delete errors['matchPassword'];
        if (Object.keys(errors).length === 0) {
          group.get('confirmPassword')?.setErrors(null);
        } else {
          group.get('confirmPassword')?.setErrors(errors);
        }
      }
      return null;
    }
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.userId || !this.code) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;
    this.submitSuccess = null;

    const data = {
      newPassword: this.resetForm.value.newPassword
    };

    this.authService.ResetPassword(this.userId, this.code, data).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.isSuccess || res.isSuccess === undefined) {
          this.submitSuccess = res.message || 'Password has been successfully changed.';
          this.resetForm.reset();
        } else {
          this.submitError = res.message || 'Failed to reset password.';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err.error?.message || err.error?.Message || 'Something went wrong. The link might be expired.';
      }
    });
  }
}
