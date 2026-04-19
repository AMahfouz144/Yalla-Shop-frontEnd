import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { AdminCustomer } from '../../models/admin.models';
import { AdminDashboardService } from '../../services/admin-dashboard.service';
import { AdminToastService } from '../../services/admin-toast.service';

@Component({
  selector: 'app-manage-customers',
  templateUrl: './manage-customers.component.html',
  styleUrl: './manage-customers.component.css'
})
export class ManageCustomersComponent implements OnInit {
  customers: AdminCustomer[] = [];
  searchTerm = '';
  pageSize = 10;
  currentPage = 1;
  isLoading = false;
  errorMessage: string | null = null;
  processingUserId: string | null = null;

  constructor(
    private readonly adminDashboardService: AdminDashboardService,
    private readonly toastService: AdminToastService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  get filteredCustomers(): AdminCustomer[] {
    const value = this.searchTerm.trim().toLowerCase();
    if (!value) {
      return this.customers;
    }
    return this.customers.filter(
      (customer) =>
        customer.fullName.toLowerCase().includes(value) ||
        customer.userName.toLowerCase().includes(value)
    );
  }

  get pagedCustomers(): AdminCustomer[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCustomers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredCustomers.length / this.pageSize));
  }

  loadCustomers(forceRefresh = true): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.adminDashboardService
      .getCustomers(forceRefresh)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (customers) => {
          this.customers = customers;
          this.ensureValidPage();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || error?.message || 'Unable to load customers.';
        }
      });
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  changePage(direction: -1 | 1): void {
    this.currentPage = Math.min(this.totalPages, Math.max(1, this.currentPage + direction));
  }

  toggleStatus(customer: AdminCustomer): void {
    this.processingUserId = customer.id;
    this.adminDashboardService
      .toggleUserStatus(customer.id)
      .pipe(finalize(() => (this.processingUserId = null)))
      .subscribe({
        next: () => {
          this.toastService.success('Customer status updated successfully.');
          this.loadCustomers(true);
        },
        error: (error) => {
          const message = error?.error?.message || error?.message || 'Failed to update customer status.';
          this.toastService.error(message);
        }
      });
  }

  trackByUserId(_index: number, user: AdminCustomer): string {
    return user.id;
  }

  private ensureValidPage(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }
}
