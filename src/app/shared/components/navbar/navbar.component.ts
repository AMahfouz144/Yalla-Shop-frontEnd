import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  cartCount$!: Observable<number>;
  isBouncing = false;

  constructor(
    private authService: AuthService, 
    private cartService: CartService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cartCount$ = this.cartService.cartCount$;
    // Fetch initial cart explicitly on startup if logged in might be handled globally,
    // but we can listen for count increments to trigger bounce animation.
    this.cartCount$.subscribe((count) => {
      if (count > 0) {
        this.isBouncing = true;
        setTimeout(() => this.isBouncing = false, 400); // 400ms duration
      }
    });
  }

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
