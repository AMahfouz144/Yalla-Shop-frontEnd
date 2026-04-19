import { Component } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;
  submitError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      userName: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    const credentials = this.loginForm.value;

    this.authService.Login(credentials).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.isSuccess) {
          this.authService.setSession(res.data);

          const fallbackRoute = this.authService.getDashboardRouteByRole(res.data.role);
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          const canUseReturnUrl =
            !!returnUrl &&
            !returnUrl.startsWith('/auth') &&
            (res.data.role.toLowerCase() === 'admin' || !returnUrl.startsWith('/admin'));

          this.router.navigateByUrl(canUseReturnUrl ? returnUrl : fallbackRoute);
        } else {
          this.submitError = res.message || 'Login failed.';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err.error?.message || err.error?.Message || 'Invalid credentials or server error.';
      }
    });
  }
}
