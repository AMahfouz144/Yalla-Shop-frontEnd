import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ProfileServiceService } from '../../../../core/services/profile-service.service';
import { UpdateProfile } from '../../../../core/models/update-profile';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isLoading: boolean = false;
  isUpdating: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileServiceService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
  }

  egyptianPhoneValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const val = control.value;
    if (/[^0-9]/.test(val)) return { egPhone: 'Phone number must contain digits only (no spaces or letters).' };
    if (!val.startsWith('01')) return { egPhone: 'Phone number must start with a valid Egyptian prefix.' };
    if (!/^01[0125]/.test(val)) return { egPhone: 'Valid Egyptian mobile prefixes are: 010, 011, 012, or 015.' };
    if (val.length !== 11) return { egPhone: `Number must be exactly 11 digits long (currently ${val.length}).` };
    if (!/^01[0-2,5][0-9]{8}$/.test(val)) return { egPhone: 'Number does not match the valid Egyptian format.' };
    return null;
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      id: [''],
      fullName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      address: [''],
      phoneNumber: ['', [this.egyptianPhoneValidator]]
    });
  }

  loadProfile(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'No token found. Please relogin.';
      return;
    }

    this.isLoading = true;
    this.profileService.getProfile(token).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.isSuccess && response.data) {
          const data = response.data;
          this.profileForm.patchValue({
            id: data.id,
            fullName: data.fullName,
            email: data.email || data.userName,
            address: data.address || '',
            phoneNumber: data.phoneNumber || ''
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load profile. Please try again.';
      }
    });
  }

  onUpdate(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    this.isUpdating = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateData: UpdateProfile = {
      fullName: this.profileForm.value.fullName,
      address: this.profileForm.value.address,
      phoneNumber: this.profileForm.value.phoneNumber
    };

    this.profileService.updateProfile(token, updateData).subscribe({
      next: (response) => {
        this.isUpdating = false;
        if (response.isSuccess) {
          this.successMessage = 'Profile updated successfully!';
        } else {
          this.errorMessage = response.message || 'Failed to update user profile.';
        }
      },
      error: (err) => {
        this.isUpdating = false;
        this.errorMessage = 'An error occurred while updating profile.';
      }
    });
  }
}
