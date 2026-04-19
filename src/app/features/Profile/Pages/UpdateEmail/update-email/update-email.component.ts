import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileServiceService } from '../../../../../core/services/profile-service.service';
import { UpdateEmailRequest } from '../../../../../core/models/update-email-request';

@Component({
  selector: 'app-update-email',
  templateUrl: './update-email.component.html',
  styleUrl: './update-email.component.css'
})
export class UpdateEmailComponent {
  emailForm: FormGroup;
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess: string | null = null;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileServiceService
  ) {
    this.emailForm = this.fb.group({
      newEmail: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.submitError = 'No token found. Please login again.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;
    this.submitSuccess = null;

    const payload: UpdateEmailRequest = {
      newEmail: this.emailForm.value.newEmail
    };

    this.profileService.updateEmailRequest(token, payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.isSuccess) {
          this.submitSuccess = response.message || 'Email update request sent successfully.';
          this.emailForm.reset();
        } else {
          this.submitError = response.message || 'Unable to update email at the moment.';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err?.error?.message || err?.error?.Message || 'An unexpected error occurred while updating your email.';
      }
    });
  }
}
