import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      account_role: ['customer', [Validators.required]],
      fullName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(7), 
        Validators.maxLength(20),
        this.passwordValidator
      ]],
      confirmPassword: ['', [Validators.required]],
      address: ['', [Validators.maxLength(50)]],
      storeName: ['', [Validators.maxLength(50)]],
      terms: [false, [Validators.requiredTrue]]
    }, { validators: this.matchPasswordValidator });

    // Reset storeName if user switches back to customer
    this.registerForm.get('account_role')?.valueChanges.subscribe(role => {
      const storeNameControl = this.registerForm.get('storeName');
      if (role === 'customer') {
        storeNameControl?.setValue('');
        storeNameControl?.clearValidators();
        storeNameControl?.setValidators([Validators.maxLength(50)]);
      } else {
        // Only set max length for seller, it's optional
        storeNameControl?.setValidators([Validators.maxLength(50)]);
      }
      storeNameControl?.updateValueAndValidity();
    });
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
    const password = group.get('password')?.value;
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

  get isSeller(): boolean {
    return this.registerForm.get('account_role')?.value === 'seller';
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;
    this.submitSuccess = null;

    const formValues = this.registerForm.value;
    
    const requestData = {
      fullName: formValues.fullName,
      userName: formValues.email,
      password: formValues.password,
      role: formValues.account_role === 'seller' ? 'Seller' : 'Customer',
      address: formValues.address || null,
      storeName: this.isSeller ? (formValues.storeName || null) : null
    };

    this.authService.register(requestData).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        
        const isSuccess = response?.isSuccess !== undefined ? response.isSuccess : response?.IsSuccess;
        const message = response?.message || response?.Message || 'Action completed successfully.';
        
        if (isSuccess) {
          this.submitSuccess = message;
          this.submitError = null;
          this.registerForm.reset({
            account_role: 'customer'
          });
        } else {
          this.submitError = message;
          this.submitSuccess = null;
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitSuccess = null;
        
        // Handle server ResponseModel in case it arrives as an error
        const errorMessage = err?.error?.message || err?.error?.Message || 'Registration failed. Please try again.';
        this.submitError = errorMessage;
      }
    });
  }
}

