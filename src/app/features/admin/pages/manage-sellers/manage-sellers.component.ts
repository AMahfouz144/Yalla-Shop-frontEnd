import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { AdminSeller } from '../../models/admin.models';
import { AdminDashboardService } from '../../services/admin-dashboard.service';
import { AdminToastService } from '../../services/admin-toast.service';

@Component({
  selector: 'app-manage-sellers',
  templateUrl: './manage-sellers.component.html',
  styleUrl: './manage-sellers.component.css'
})
export class ManageSellersComponent implements OnInit {
  sellers: AdminSeller[] = [];
  searchTerm = '';
  pageSize = 10;
  currentPage = 1;
  isLoading = false;
  errorMessage: string | null = null;
  processingSellerId: string | null = null;

  constructor(
    private readonly adminDashboardService: AdminDashboardService,
    private readonly toastService: AdminToastService
  ) {}

  ngOnInit(): void {
    this.loadSellers();
  }

  get filteredSellers(): AdminSeller[] {
    const value = this.searchTerm.trim().toLowerCase();
    if (!value) {
      return this.sellers;
    }
    return this.sellers.filter(
      (seller) =>
        seller.fullName.toLowerCase().includes(value) ||
        seller.userName.toLowerCase().includes(value)
    );
  }

  get pagedSellers(): AdminSeller[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredSellers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredSellers.length / this.pageSize));
  }

  loadSellers(forceRefresh = true): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.adminDashboardService.getSellers(forceRefresh)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (sellers) => {
          this.sellers = sellers;
          this.ensureValidPage();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || error?.message || 'Unable to load sellers right now.';
        }
      });
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  changePage(direction: -1 | 1): void {
    this.currentPage = Math.min(this.totalPages, Math.max(1, this.currentPage + direction));
  }

  toggleStatus(seller: AdminSeller): void {
    this.processingSellerId = seller.id;
    this.errorMessage = null;

    this.adminDashboardService.toggleUserStatus(seller.id)
      .pipe(finalize(() => {
        this.processingSellerId = null;
      }))
      .subscribe({
        next: () => {
          this.toastService.success('Seller status updated successfully.');
          this.loadSellers(true);
        },
        error: (error) => {
          const message = error?.error?.message || error?.message || 'Unable to update seller status.';
          this.toastService.error(message);
        }
      });
  }

  trackBySellerId(_index: number, seller: AdminSeller): string {
    return seller.id;
  }

  private ensureValidPage(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }
}
