import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ProfileServiceService } from '../../../../../core/services/profile-service.service';
import { ChangePassword } from '../../../../../core/models/change-password';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent implements OnInit {
  passwordForm!: FormGroup;
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess: string | null = null;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileServiceService
  ) { }

  ngOnInit(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required, 
        Validators.minLength(7), 
        Validators.maxLength(20),
        this.passwordValidator
      ]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.matchPasswordValidator });
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNonAlpha = /[^a-zA-Z]/.test(value);
    const valid = hasUpperCase && hasLowerCase && hasNonAlpha;
    if (!valid) {
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
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.submitError = 'No token found, please relogin.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;
    this.submitSuccess = null;

    const requestData: ChangePassword = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.profileService.changePassword(token, requestData).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        if (response.isSuccess) {
          this.submitSuccess = 'Password changed successfully.';
          this.passwordForm.reset();
        } else {
          this.submitError = response.message || 'Failed to change password.';
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.submitError = err?.error?.message || err?.error?.Message || 'Incorrect Current Password or invalid request parameters.';
      }
    });
  }

  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
