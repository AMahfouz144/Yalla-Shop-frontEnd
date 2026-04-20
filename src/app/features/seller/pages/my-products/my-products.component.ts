import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SellerSettingsService } from '../../services/seller-settings.service';
import { Product } from '../../../product/models/product.model';
import { ProductService } from '../../../product/services/product.service';
import { formatHttpError } from '../../../../core/utils/http-error.util';
import { API_ORIGIN } from '../../../../core/config/api-base';
import { CategoryService } from '../../../../core/services/category.service';
import { Category } from '../../../../core/models/category.model';
import { AuthService } from '../../../../core/services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-my-products',
  templateUrl: './my-products.component.html',
  styleUrl: './my-products.component.css'
})
export class MyProductsComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  loading = false;
  error: string | null = null;
  deletingId: number | null = null;
  searchTerm = '';
  showCategoryModal = false;
  categoryName = '';
  categoryError: string | null = null;
  creatingCategory = false;
  categoryToast: string | null = null;
  private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private categoriesCache: Category[] = [];

  constructor(
    private readonly sellerSettings: SellerSettingsService,
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
      this.toastTimeoutId = null;
    }
  }

  get sellerId(): number | null {
    return this.sellerSettings.getSellerNumericId();
  }

  get filteredProducts(): Product[] {
    if (!this.searchTerm.trim()) {
      return this.products;
    }
    const term = this.searchTerm.toLowerCase();
    return this.products.filter(
      p => p.name.toLowerCase().includes(term) || (p.description || '').toLowerCase().includes(term)
    );
  }

  get canCreateCategory(): boolean {
    return this.authService.hasRole('Seller');
  }

  load(): void {
    const sid = this.sellerSettings.getSellerNumericId();

    // If not cached, try auto-resolving first
    if (sid == null) {
      this.loading = true;
      this.sellerSettings.autoResolve().subscribe({
        next: resolvedId => {
          if (resolvedId != null) {
            this.fetchProducts(resolvedId);
          } else {
            this.loading = false;
            this.products = [];
            this.error = 'Could not determine your seller account. Please contact support.';
          }
        },
        error: () => {
          this.loading = false;
          this.products = [];
          this.error = 'Could not determine your seller account.';
        }
      });
      return;
    }

    this.fetchProducts(sid);
  }

  private fetchProducts(sid: number): void {
    this.loading = true;
    this.error = null;
    this.productService.getProductsForSeller(sid).subscribe({
      next: rows => {
        this.products = rows;
        this.loading = false;
      },
      error: err => {
        this.error = formatHttpError(err, 'Could not load products');
        this.products = [];
        this.loading = false;
      }
    });
  }

  viewDetails(p: Product): void {
    this.router.navigate(['/seller/products', p.id, 'details']);
  }

  edit(p: Product): void {
    this.router.navigate(['/seller/products', p.id, 'edit']);
  }

  add(): void {
    this.router.navigate(['/seller/products/new']);
  }

  openCategoryModal(): void {
    if (!this.canCreateCategory || this.creatingCategory) {
      return;
    }
    this.showCategoryModal = true;
    this.categoryName = '';
    this.categoryError = null;
    this.fetchCategoriesCache();
  }

  closeCategoryModal(): void {
    if (this.creatingCategory) {
      return;
    }
    this.showCategoryModal = false;
    this.categoryName = '';
    this.categoryError = null;
  }

  submitCategory(): void {
    if (!this.canCreateCategory || this.creatingCategory) {
      return;
    }

    const name = this.categoryName.trim();
    if (!name) {
      this.categoryError = 'Category name is required.';
      return;
    }
    if (name.length < 3) {
      this.categoryError = 'Category name must be at least 3 characters.';
      return;
    }

    const exists = this.categoriesCache.some(
      c => (c.name || '').trim().toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      this.categoryError = 'This category already exists.';
      return;
    }

    this.creatingCategory = true;
    this.categoryError = null;
    this.categoryService
      .createCategory(name)
      .pipe(finalize(() => (this.creatingCategory = false)))
      .subscribe({
        next: () => {
          this.showToast('Category created successfully');
          this.closeCategoryModal();
          this.fetchCategoriesCache();
        },
        error: err => {
          this.categoryError = formatHttpError(err, 'Could not create category');
        }
      });
  }

  deleteProduct(p: Product): void {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) {
      return;
    }
    this.deletingId = p.id;
    this.productService.delete(p.id).subscribe({
      next: () => {
        this.deletingId = null;
        this.load();
      },
      error: err => {
        this.deletingId = null;
        this.error = formatHttpError(err, 'Could not delete product');
      }
    });
  }

  statusLabel(status: number): string {
    return ['Pending', 'Accepted', 'Rejected'][status] ?? String(status);
  }

  getImageUrl(picture: string | null): string | null {
    if (!picture) return null;
    if (picture.startsWith('http://') || picture.startsWith('https://') || picture.startsWith('data:')) {
      return picture;
    }
    return `${API_ORIGIN}/${picture}`;
  }

  private fetchCategoriesCache(): void {
    this.categoryService.getAll().subscribe({
      next: rows => (this.categoriesCache = Array.isArray(rows) ? rows : []),
      error: () => {
        this.categoriesCache = [];
      }
    });
  }

  private showToast(message: string): void {
    this.categoryToast = message;
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }
    this.toastTimeoutId = setTimeout(() => {
      this.categoryToast = null;
      this.toastTimeoutId = null;
    }, 2500);
  }
}
