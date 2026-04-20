import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  constructor(private authService: AuthService, private router: Router) { }

  get isCustomer(): boolean {
    return this.authService.isAuthenticated() && this.authService.hasRole('Customer');
  }

  get isLoggedIn(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }

    return !!localStorage.getItem('token');
  }

  get userName(): string {
    if (typeof localStorage === 'undefined') {
      return 'User';
    }

    return localStorage.getItem('fullName') || 'User';
  }

  get isSeller(): boolean {
    return this.authService.hasRole('seller');
  }

  get isAdmin(): boolean {
    return this.authService.hasRole('admin');
  }

  get dashboardRoute(): string {
    return this.authService.getDashboardRouteByRole();
  }

  logout(): void {
    this.authService.Logout();
    this.router.navigate(['/auth/login']);
  }
}
