import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { AdminProduct } from '../../models/admin.models';
import { AdminDashboardService } from '../../services/admin-dashboard.service';
import { AdminToastService } from '../../services/admin-toast.service';
import { ProductStatus } from './product.enum';

@Component({
  selector: 'app-pending-products',
  templateUrl: './pending-products.component.html',
  styleUrl: './pending-products.component.css'
})
export class PendingProductsComponent implements OnInit {
  products: AdminProduct[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  processingId: string | null = null;

  constructor(
    private readonly adminDashboardService: AdminDashboardService,
    private readonly toastService: AdminToastService
  ) {}

  ngOnInit(): void {
    this.loadPendingProducts();
  }

  loadPendingProducts(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.adminDashboardService
      .getPendingProducts(true)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (products) => (this.products = products),
        error: (error) => {
          this.errorMessage = error?.error?.message || error?.message || 'Unable to load pending products.';
        }
      });
  }

  accept(product: AdminProduct): void {
    this.updateStatus(product, 1, 'Product accepted.');
  }

  reject(product: AdminProduct): void {
    this.updateStatus(product, 2, 'Product rejected.');
  }

  trackByProductId(_index: number, product: AdminProduct): string {
    return product.id;
  }

  private updateStatus(product: AdminProduct, status: ProductStatus, successMessage: string): void {
    this.processingId = product.id;
    this.adminDashboardService
      .updateProductStatus(product.id, status)
      .pipe(finalize(() => (this.processingId = null)))
      .subscribe({
        next: () => {
          this.toastService.success(successMessage);
          this.loadPendingProducts();
        },
        error: (error) => {
          const message = error?.error?.message || error?.message || 'Unable to update product status.';
          this.toastService.error(message);
        }
      });
  }
}
