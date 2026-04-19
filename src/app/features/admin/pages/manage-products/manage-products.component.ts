import { Component, OnInit } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { AdminProduct, ProductStatus } from '../../models/admin.models';
import { AdminDashboardService } from '../../services/admin-dashboard.service';

type ProductStatusFilter = 'All' | ProductStatus;

@Component({
  selector: 'app-manage-products',
  templateUrl: './manage-products.component.html',
  styleUrl: './manage-products.component.css'
})
export class ManageProductsComponent implements OnInit {
  readonly statusFilters: ReadonlyArray<ProductStatusFilter> = ['All', 'Pending', 'Accepted', 'Rejected'];

  products: AdminProduct[] = [];
  selectedStatus: ProductStatusFilter = 'All';
  isLoading = false;
  errorMessage: string | null = null;
  processingProductId: string | null = null;

  constructor(private readonly adminDashboardService: AdminDashboardService) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  get filteredProducts(): AdminProduct[] {
    if (this.selectedStatus === 'All') {
      return this.products;
    }

    return this.products.filter((product) => product.status === this.selectedStatus);
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.adminDashboardService.getProducts()
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (products) => {
          this.products = products;
        },
        error: () => {
          this.errorMessage = 'Unable to load products right now.';
        }
      });
  }

  setStatusFilter(filter: ProductStatusFilter): void {
    this.selectedStatus = filter;
  }

  acceptProduct(product: AdminProduct): void {
    this.runProductAction(product, this.adminDashboardService.acceptProduct(product.id));
  }

  rejectProduct(product: AdminProduct): void {
    this.runProductAction(product, this.adminDashboardService.rejectProduct(product.id));
  }

  deleteProduct(product: AdminProduct): void {
    this.processingProductId = product.id;
    this.errorMessage = null;

    this.adminDashboardService.deleteProduct(product.id)
      .pipe(finalize(() => {
        this.processingProductId = null;
      }))
      .subscribe({
        next: () => {
          this.loadProducts();
        },
        error: () => {
          this.errorMessage = `Unable to delete ${product.name}.`;
        }
      });
  }

  getStatusCount(status: ProductStatus): number {
    return this.products.filter((product) => product.status === status).length;
  }

  getStatusClasses(status: ProductStatus): string {
    switch (status) {
      case 'Accepted':
        return 'bg-emerald-100 text-emerald-700';
      case 'Rejected':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0
    }).format(price);
  }

  trackByProductId(_index: number, product: AdminProduct): string {
    return product.id;
  }

  private runProductAction(product: AdminProduct, request$: Observable<AdminProduct>): void {
    this.processingProductId = product.id;
    this.errorMessage = null;

    request$
      .pipe(finalize(() => {
        this.processingProductId = null;
      }))
      .subscribe({
        next: () => {
          this.loadProducts();
        },
        error: () => {
          this.errorMessage = `Unable to update ${product.name}.`;
        }
      });
  }
}
