import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, AuthSessionUser } from '../../../../core/services/auth.service';
import { AdminNavigationItem } from '../../models/admin.models';

@Component({
  selector: 'app-admin-shell',
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.css'
})
export class AdminShellComponent {
  readonly navigationItems: ReadonlyArray<AdminNavigationItem> = [
    {
      label: 'Dashboard',
      route: '/admin/dashboard',
      icon: 'space_dashboard',
      helperText: 'Summary and quick insights'
    },
    {
      label: 'Users',
      route: '/admin/users',
      icon: 'group',
      helperText: 'All marketplace accounts'
    },
    {
      label: 'Sellers',
      route: '/admin/sellers',
      icon: 'storefront',
      helperText: 'Seller approvals and activity'
    },
    {
      label: 'Categories',
      route: '/admin/categories',
      icon: 'category',
      helperText: 'Expandable product catalog'
    },
    {
      label: 'Products',
      route: '/admin/products',
      icon: 'inventory_2',
      helperText: 'Moderation and status updates'
    }
  ];

  isSidebarOpen = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) { }

  get currentUser(): AuthSessionUser | null {
    return this.authService.getSessionUser();
  }

  get displayName(): string {
    return this.currentUser?.fullName || 'Admin User';
  }

  get displayEmail(): string {
    return this.currentUser?.userName || 'admin@yalla-shop.com';
  }

  get displayRole(): string {
    return this.currentUser?.role || 'Admin';
  }

  get initials(): string {
    return this.displayName
      .split(' ')
      .filter((part) => !!part)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  logout(): void {
    this.authService.Logout();
    this.router.navigate(['/auth/login']);
  }

  trackByRoute(_index: number, item: AdminNavigationItem): string {
    return item.route;
  }
}
