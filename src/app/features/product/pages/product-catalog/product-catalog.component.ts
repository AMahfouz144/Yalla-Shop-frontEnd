import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Category } from '../../../../core/models/category.model';
import { CategoryService } from '../../../../core/services/category.service';
import { CartService } from '../../../../core/services/cart.service';
import { formatHttpError } from '../../../../core/utils/http-error.util';
import { productPictureSrc } from '../../../../core/utils/product-image.util';
import { Product, ProductFilterParams } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-catalog',
  templateUrl: './product-catalog.component.html',
  styleUrls: ['./product-catalog.component.scss']
})
export class ProductCatalogComponent implements OnInit {
  products: Product[] = [];
  /** Product ids whose image failed to load (404/500, etc.) — plain object for change detection. */
  private imageLoadFailed: Record<number, true> = {};
  categories: Category[] = [];
  loading = false;
  error: string | null = null;
  cartMessage: string | null = null;
  cartError: string | null = null;

  filterOpen = false;

  /** Draft (drawer) — mirrors backend `ProductFilterDto`. */
  draftName = '';
  draftDescription = '';
  draftMinPrice: number | null = null;
  draftMaxPrice: number | null = null;
  draftStockQuantity: number | null = null;
  draftCategoryName = '';
  draftCreatedFrom = '';
  draftCreatedTo = '';
  draftSortBy = '';
  draftSortOrder: 'asc' | 'desc' = 'asc';

  /** Applied filters (same shape as draft after Apply / chip / reset). */
  appliedName = '';
  appliedDescription = '';
  appliedMinPrice: number | null = null;
  appliedMaxPrice: number | null = null;
  appliedStockQuantity: number | null = null;
  appliedCategoryName = '';
  appliedCreatedFrom = '';
  appliedCreatedTo = '';
  appliedSortBy = '';
  appliedSortOrder: 'asc' | 'desc' = 'asc';

  constructor(
    private readonly router: Router,
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
    private readonly cartService: CartService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.categoryService
      .getAll()
      .pipe(catchError(() => of([] as Category[])))
      .subscribe(categories => {
        this.categories = categories;
        this.loadProducts();
      });
  }

  pictureSrcFor(p: Product): string | null {
    if (this.imageLoadFailed[p.id]) {
      return null;
    }
    return productPictureSrc(p.picture);
  }

  onProductImageError(p: Product): void {
    if (this.imageLoadFailed[p.id]) {
      return;
    }
    this.imageLoadFailed = { ...this.imageLoadFailed, [p.id]: true };
    this.cdr.markForCheck();
  }

  openFilters(): void {
    this.draftName = this.appliedName;
    this.draftDescription = this.appliedDescription;
    this.draftMinPrice = this.appliedMinPrice;
    this.draftMaxPrice = this.appliedMaxPrice;
    this.draftStockQuantity = this.appliedStockQuantity;
    this.draftCategoryName = this.appliedCategoryName;
    this.draftCreatedFrom = this.appliedCreatedFrom;
    this.draftCreatedTo = this.appliedCreatedTo;
    this.draftSortBy = this.appliedSortBy;
    this.draftSortOrder = this.appliedSortOrder;
    this.filterOpen = true;
  }

  closeFilters(): void {
    this.filterOpen = false;
  }

  applyFilters(): void {
    this.appliedName = (this.draftName || '').trim();
    this.appliedDescription = (this.draftDescription || '').trim();
    this.appliedMinPrice = this.draftMinPrice;
    this.appliedMaxPrice = this.draftMaxPrice;
    this.appliedStockQuantity = this.draftStockQuantity;
    this.appliedCategoryName = (this.draftCategoryName || '').trim();
    this.appliedCreatedFrom = (this.draftCreatedFrom || '').trim();
    this.appliedCreatedTo = (this.draftCreatedTo || '').trim();
    this.appliedSortBy = (this.draftSortBy || '').trim();
    this.appliedSortOrder = this.draftSortOrder;
    this.filterOpen = false;
    this.loadProducts();
  }

  resetFilters(): void {
    this.draftName = '';
    this.draftDescription = '';
    this.draftMinPrice = null;
    this.draftMaxPrice = null;
    this.draftStockQuantity = null;
    this.draftCategoryName = '';
    this.draftCreatedFrom = '';
    this.draftCreatedTo = '';
    this.draftSortBy = '';
    this.draftSortOrder = 'asc';
    this.appliedName = '';
    this.appliedDescription = '';
    this.appliedMinPrice = null;
    this.appliedMaxPrice = null;
    this.appliedStockQuantity = null;
    this.appliedCategoryName = '';
    this.appliedCreatedFrom = '';
    this.appliedCreatedTo = '';
    this.appliedSortBy = '';
    this.appliedSortOrder = 'asc';
    this.filterOpen = false;
    this.loadProducts();
  }

  setCategoryChip(name: string): void {
    this.appliedCategoryName = name;
    this.draftCategoryName = name;
    this.loadProducts();
  }

  private buildFilterParams(): ProductFilterParams {
    const p: ProductFilterParams = {};
    if (this.appliedName) {
      p.name = this.appliedName;
    }
    if (this.appliedDescription) {
      p.description = this.appliedDescription;
    }
    if (this.appliedMinPrice != null) {
      p.minPrice = this.appliedMinPrice;
    }
    if (this.appliedMaxPrice != null) {
      p.maxPrice = this.appliedMaxPrice;
    }
    if (this.appliedStockQuantity != null) {
      p.stockQuantity = this.appliedStockQuantity;
    }
    if (this.appliedCategoryName) {
      p.categoryName = this.appliedCategoryName;
    }
    if (this.appliedCreatedFrom) {
      p.createdFrom = this.appliedCreatedFrom;
    }
    if (this.appliedCreatedTo) {
      p.createdTo = this.appliedCreatedTo;
    }
    if (this.appliedSortBy) {
      p.sortBy = this.appliedSortBy;
      p.sortOrder = this.appliedSortOrder;
    }
    return p;
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;
    this.productService
      .filter(this.buildFilterParams())
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: rows => {
          this.imageLoadFailed = {};
          this.products = rows;
        },
        error: err => (this.error = formatHttpError(err, 'Could not load products'))
      });
  }

  goToProduct(id: number, event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    void this.router.navigate(['/products', id]);
  }

  addToCart(p: Product, event: Event): void {
    event.stopPropagation();
    this.cartMessage = null;
    this.cartError = null;
    this.cartService.addItem(p.id, 1).subscribe({
      next: () => (this.cartMessage = `Added “${p.name}” to cart`),
      error: err => (this.cartError = formatHttpError(err, 'Could not add to cart'))
    });
  }
}
