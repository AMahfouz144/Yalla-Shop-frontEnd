import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, AuthSessionUser } from '../../../../core/services/auth.service';
import { SellerSettingsService } from '../../services/seller-settings.service';

@Component({
  selector: 'app-seller-shell',
  templateUrl: './seller-shell.component.html',
  styleUrl: './seller-shell.component.css'
})
export class SellerShellComponent implements OnInit {
  readonly navigationItems: ReadonlyArray<{
    label: string;
    route: string;
    icon: string;
    helperText: string;
    linkActiveExact: boolean;
  }> = [
    { label: 'Overview', route: '/seller/overview', icon: 'dashboard', helperText: 'Summary and shortcuts', linkActiveExact: true },
    { label: 'My products', route: '/seller/products', icon: 'inventory_2', helperText: 'List, edit, or remove your listings', linkActiveExact: true },
    { label: 'Add product', route: '/seller/products/new', icon: 'add_box', helperText: 'Create a new listing', linkActiveExact: true },
    { label: 'Orders', route: '/seller/orders', icon: 'receipt_long', helperText: 'Orders containing your products', linkActiveExact: true },
    { label: 'Profile', route: '/seller/profile', icon: 'person', helperText: 'Account shortcuts', linkActiveExact: true }
  ];

  isSidebarOpen = false;
  resolving = false;
  resolved = false;

  constructor(
    private readonly authService: AuthService,
    private readonly sellerSettings: SellerSettingsService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    // Debug: log JWT claims to console so we can see what's available
    this.debugLogJwtClaims();

    // Auto-resolve seller ID on dashboard load
    if (this.sellerSettings.getSellerNumericId() == null) {
      this.resolving = true;
      this.sellerSettings.autoResolve().subscribe({
        next: (id) => {
          this.resolving = false;
          this.resolved = true;
          console.log('[SellerShell] Auto-resolved seller ID:', id);
        },
        error: () => {
          this.resolving = false;
          this.resolved = true;
        }
      });
    } else {
      this.resolved = true;
    }
  }

  /** Logs decoded JWT claims to the console for debugging. */
  private debugLogJwtClaims(): void {
    if (typeof localStorage === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const parts = token.split('.');
      if (parts.length < 2) return;
      let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (payload.length % 4 !== 0) payload += '=';
      const claims = JSON.parse(atob(payload));
      console.log('[SellerShell] JWT claims:', claims);
    } catch {
      console.warn('[SellerShell] Could not decode JWT');
    }
  }

  get currentUser(): AuthSessionUser | null {
    return this.authService.getSessionUser();
  }

  get displayName(): string {
    return this.currentUser?.fullName || 'Seller';
  }

  get displayEmail(): string {
    return this.currentUser?.userName || '';
  }

  get initials(): string {
    return this.displayName
      .split(' ')
      .filter(p => !!p)
      .slice(0, 2)
      .map(p => p[0]?.toUpperCase() ?? '')
      .join('');
  }

  get sellerNumericId(): number | null {
    return this.sellerSettings.getSellerNumericId();
  }

  get showSellerIdHint(): boolean {
    return this.resolved && !this.resolving && this.sellerNumericId == null;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  logout(): void {
    this.sellerSettings.clear();
    this.authService.Logout();
    this.router.navigate(['/auth/login']);
  }

  trackByRoute(_i: number, item: { route: string }): string {
    return item.route;
  }
}
