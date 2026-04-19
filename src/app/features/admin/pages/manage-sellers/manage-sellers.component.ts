import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { AdminSeller, SellerApprovalStatus } from '../../models/admin.models';
import { AdminDashboardService } from '../../services/admin-dashboard.service';

@Component({
  selector: 'app-manage-sellers',
  templateUrl: './manage-sellers.component.html',
  styleUrl: './manage-sellers.component.css'
})
export class ManageSellersComponent implements OnInit {
  sellers: AdminSeller[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  processingSellerId: string | null = null;

  constructor(private readonly adminDashboardService: AdminDashboardService) { }

  ngOnInit(): void {
    this.loadSellers();
  }

  get pendingSellersCount(): number {
    return this.sellers.filter((seller) => seller.sellerApprovalStatus === 'Pending').length;
  }

  get approvedSellersCount(): number {
    return this.sellers.filter((seller) => seller.sellerApprovalStatus === 'Approved').length;
  }

  loadSellers(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.adminDashboardService.getSellers()
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (sellers) => {
          this.sellers = sellers;
        },
        error: () => {
          this.errorMessage = 'Unable to load sellers right now.';
        }
      });
  }

  approveSeller(seller: AdminSeller): void {
    this.updateSellerApproval(seller, 'Approved');
  }

  rejectSeller(seller: AdminSeller): void {
    this.updateSellerApproval(seller, 'Rejected');
  }

  toggleSellerStatus(seller: AdminSeller): void {
    this.processingSellerId = seller.id;
    this.errorMessage = null;

    this.adminDashboardService.toggleUserStatus(seller.id)
      .pipe(finalize(() => {
        this.processingSellerId = null;
      }))
      .subscribe({
        next: () => {
          this.loadSellers();
        },
        error: () => {
          this.errorMessage = `Unable to update ${seller.name}'s status.`;
        }
      });
  }

  getApprovalClasses(status: SellerApprovalStatus): string {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-100 text-emerald-700';
      case 'Rejected':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  }

  getStatusClasses(isActive: boolean): string {
    return isActive
      ? 'bg-sky-100 text-sky-700'
      : 'bg-slate-200 text-slate-700';
  }

  trackBySellerId(_index: number, seller: AdminSeller): string {
    return seller.id;
  }

  private updateSellerApproval(seller: AdminSeller, status: SellerApprovalStatus): void {
    this.processingSellerId = seller.id;
    this.errorMessage = null;

    this.adminDashboardService.updateSellerApproval(seller.id, status)
      .pipe(finalize(() => {
        this.processingSellerId = null;
      }))
      .subscribe({
        next: () => {
          this.loadSellers();
        },
        error: () => {
          this.errorMessage = `Unable to update ${seller.name}'s approval status.`;
        }
      });
  }
}
