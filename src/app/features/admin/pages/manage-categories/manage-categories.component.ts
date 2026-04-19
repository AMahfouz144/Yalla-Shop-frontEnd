import { Component, OnInit } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { AdminCategory, AdminProduct, ProductStatus } from '../../models/admin.models';
import { AdminDashboardService } from '../../services/admin-dashboard.service';

@Component({
  selector: 'app-manage-categories',
  templateUrl: './manage-categories.component.html',
  styleUrl: './manage-categories.component.css'
})
export class ManageCategoriesComponent implements OnInit {
  categories: AdminCategory[] = [];
  expandedCategoryIds = new Set<string>();
  isLoading = false;
  errorMessage: string | null = null;
  processingProductId: string | null = null;

  constructor(private readonly adminDashboardService: AdminDashboardService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.adminDashboardService.getCategoriesWithProducts()
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (categories) => {
          this.categories = categories;

          if (categories.length > 0 && this.expandedCategoryIds.size === 0) {
            this.expandedCategoryIds.add(categories[0].id);
          }
        },
        error: () => {
          this.errorMessage = 'Unable to load categories right now.';
        }
      });
  }

  toggleCategory(categoryId: string): void {
    if (this.expandedCategoryIds.has(categoryId)) {
      this.expandedCategoryIds.delete(categoryId);
      return;
    }

    this.expandedCategoryIds.add(categoryId);
  }

  isExpanded(categoryId: string): boolean {
    return this.expandedCategoryIds.has(categoryId);
  }

  getProductCount(category: AdminCategory): number {
    return category.products.length;
  }

  getPendingCount(category: AdminCategory): number {
    return category.products.filter((product) => product.status === 'Pending').length;
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
          this.loadCategories();
        },
        error: () => {
          this.errorMessage = `Unable to delete ${product.name}.`;
        }
      });
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

  trackByCategoryId(_index: number, category: AdminCategory): string {
    return category.id;
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
          this.loadCategories();
        },
        error: () => {
          this.errorMessage = `Unable to update ${product.name}.`;
        }
      });
  }
}
