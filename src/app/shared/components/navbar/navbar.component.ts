import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  
  constructor(private authService: AuthService, private router: Router) {}

  get isLoggedIn(): boolean {
    // Check if token exists in localStorage
    return !!localStorage.getItem('token');
  }

  get userName(): string {
    return localStorage.getItem('fullName') || 'User';
  }

  logout(): void {
    this.authService.Logout();
    this.router.navigate(['/auth/login']);
  }
}
