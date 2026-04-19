import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { AdminUser, AdminUserRole } from '../../models/admin.models';
import { AdminDashboardService } from '../../services/admin-dashboard.service';

type UserRoleFilter = 'All' | AdminUserRole;

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.css'
})
export class ManageUsersComponent implements OnInit {
  readonly roleFilters: ReadonlyArray<UserRoleFilter> = ['All', 'Customer', 'Seller', 'Admin'];

  users: AdminUser[] = [];
  selectedRole: UserRoleFilter = 'All';
  isLoading = false;
  errorMessage: string | null = null;
  processingUserId: string | null = null;

  constructor(private readonly adminDashboardService: AdminDashboardService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  get filteredUsers(): AdminUser[] {
    if (this.selectedRole === 'All') {
      return this.users;
    }

    return this.users.filter((user) => user.role === this.selectedRole);
  }

  get activeUsersCount(): number {
    return this.users.filter((user) => user.isActive).length;
  }

  get disabledUsersCount(): number {
    return this.users.filter((user) => !user.isActive).length;
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.adminDashboardService.getUsers()
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (users) => {
          this.users = users;
        },
        error: () => {
          this.errorMessage = 'Unable to load users right now.';
        }
      });
  }

  setRoleFilter(role: UserRoleFilter): void {
    this.selectedRole = role;
  }

  toggleUserStatus(user: AdminUser): void {
    this.processingUserId = user.id;
    this.errorMessage = null;

    this.adminDashboardService.toggleUserStatus(user.id)
      .pipe(finalize(() => {
        this.processingUserId = null;
      }))
      .subscribe({
        next: () => {
          this.loadUsers();
        },
        error: () => {
          this.errorMessage = `Unable to update ${user.name}'s status.`;
        }
      });
  }

  getRoleClasses(role: AdminUserRole): string {
    switch (role) {
      case 'Admin':
        return 'bg-violet-100 text-violet-700';
      case 'Seller':
        return 'bg-sky-100 text-sky-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  getStatusClasses(isActive: boolean): string {
    return isActive
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-rose-100 text-rose-700';
  }

  trackByUserId(_index: number, user: AdminUser): string {
    return user.id;
  }
}
