import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, finalize, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ResponseModel } from '../../../../core/Interfaces/response-model';
import { Category } from '../../../../core/models/category.model';
import { CategoryService } from '../../../../core/services/category.service';
import { CartService } from '../../../../core/services/cart.service';
import { ReviewsService } from '../../../../core/services/reviews.service';
import { AuthService } from '../../../../core/services/auth.service';
import { WishlistServiceService } from '../../../../core/services/wishlist-service.service';
import { AddProductToWhislist } from '../../../../core/models/add-product-to-whislist';
import { formatHttpError } from '../../../../core/utils/http-error.util';
import { productPictureSrc } from '../../../../core/utils/product-image.util';
import { Product, ProductFilterParams } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

/** API message when the product has no reviews (average rating endpoint). */
const NO_REVIEWS_MESSAGE = 'No Reviews';

type StarKind = 'full' | 'half' | 'empty';

function clampRating(r: number): number {
  if (!Number.isFinite(r)) {
    return 0;
  }
  return Math.max(0, Math.min(5, r));
}

/** Five star slots; supports half-stars (e.g. 3.5 → three full, one half, one empty). */
function getStars(rating: number): { kind: StarKind }[] {
  const halfStepsTotal = Math.round(clampRating(rating) * 2);
  const stars: { kind: StarKind }[] = [];
  for (let i = 0; i < 5; i++) {
    const slotStart = i * 2;
    const remaining = halfStepsTotal - slotStart;
    if (remaining >= 2) {
      stars.push({ kind: 'full' });
    } else if (remaining === 1) {
      stars.push({ kind: 'half' });
    } else {
      stars.push({ kind: 'empty' });
    }
  }
  return stars;
}

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
  wishlistMessage: string | null = null;
  wishlistError: string | null = null;
  wishlistLoading: Record<number, boolean> = {};

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
  readonly loadingSkeletons = Array.from({ length: 8 });

  /** Per-product rating for catalog cards (precomputed stars for template). */
  productRatings: Record<
    number,
    {
      status: 'loading' | 'loaded';
      noReviews: boolean;
      average: number | null;
      stars: { kind: StarKind }[];
    }
  > = {};

  constructor(
    private readonly router: Router,
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
    private readonly cartService: CartService,
    private readonly reviewsService: ReviewsService,
    private readonly wishlistService: WishlistServiceService,
    private readonly authService: AuthService,
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

  get activeFilters(): Array<{ key: string; label: string }> {
    const filters: Array<{ key: string; label: string }> = [];

    if (this.appliedName) {
      filters.push({ key: 'name', label: `Name: ${this.appliedName}` });
    }
    if (this.appliedDescription) {
      filters.push({ key: 'description', label: `Description: ${this.appliedDescription}` });
    }
    if (this.appliedMinPrice != null) {
      filters.push({ key: 'minPrice', label: `Min price: ${this.appliedMinPrice}` });
    }
    if (this.appliedMaxPrice != null) {
      filters.push({ key: 'maxPrice', label: `Max price: ${this.appliedMaxPrice}` });
    }
    if (this.appliedStockQuantity != null) {
      filters.push({ key: 'stockQuantity', label: `Min stock: ${this.appliedStockQuantity}` });
    }
    if (this.appliedCategoryName) {
      filters.push({ key: 'categoryName', label: `Category: ${this.appliedCategoryName}` });
    }
    if (this.appliedCreatedFrom) {
      filters.push({ key: 'createdFrom', label: `From: ${this.appliedCreatedFrom}` });
    }
    if (this.appliedCreatedTo) {
      filters.push({ key: 'createdTo', label: `To: ${this.appliedCreatedTo}` });
    }
    if (this.appliedSortBy) {
      filters.push({
        key: 'sort',
        label: `Sort: ${this.appliedSortBy} (${this.appliedSortOrder})`
      });
    }

    return filters;
  }

  removeActiveFilter(key: string): void {
    switch (key) {
      case 'name':
        this.appliedName = '';
        this.draftName = '';
        break;
      case 'description':
        this.appliedDescription = '';
        this.draftDescription = '';
        break;
      case 'minPrice':
        this.appliedMinPrice = null;
        this.draftMinPrice = null;
        break;
      case 'maxPrice':
        this.appliedMaxPrice = null;
        this.draftMaxPrice = null;
        break;
      case 'stockQuantity':
        this.appliedStockQuantity = null;
        this.draftStockQuantity = null;
        break;
      case 'categoryName':
        this.appliedCategoryName = '';
        this.draftCategoryName = '';
        break;
      case 'createdFrom':
        this.appliedCreatedFrom = '';
        this.draftCreatedFrom = '';
        break;
      case 'createdTo':
        this.appliedCreatedTo = '';
        this.draftCreatedTo = '';
        break;
      case 'sort':
        this.appliedSortBy = '';
        this.appliedSortOrder = 'asc';
        this.draftSortBy = '';
        this.draftSortOrder = 'asc';
        break;
      default:
        break;
    }

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
          this.loadProductRatings(rows);
        },
        error: err => (this.error = formatHttpError(err, 'Could not load products'))
      });
  }

  private loadProductRatings(products: Product[]): void {
    const ids = products.map(p => p.id);
    const loading: typeof this.productRatings = {};
    for (const id of ids) {
      loading[id] = { status: 'loading', noReviews: false, average: null, stars: [] };
    }
    this.productRatings = loading;

    if (ids.length === 0) {
      return;
    }

    forkJoin(
      ids.map(id =>
        this.reviewsService.getProductRating(id).pipe(
          catchError(() =>
            of({
              isSuccess: false,
              message: '',
              data: 0
            } as ResponseModel<number>)
          )
        )
      )
    ).subscribe(responses => {
      const next: typeof this.productRatings = { ...this.productRatings };
      responses.forEach((res, index) => {
        const id = ids[index];
        const msg = (res.message ?? '').trim();
        if (msg === NO_REVIEWS_MESSAGE) {
          next[id] = {
            status: 'loaded',
            noReviews: true,
            average: null,
            stars: []
          };
          return;
        }
        const avg = clampRating(Number(res.data));
        next[id] = {
          status: 'loaded',
          noReviews: false,
          average: avg,
          stars: getStars(avg)
        };
      });
      this.productRatings = next;
      this.cdr.markForCheck();
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

  addToWishlist(product: Product, event: Event): void {
    event.stopPropagation();
    this.wishlistMessage = null;
    this.wishlistError = null;

    if (!this.authService.isAuthenticated()) {
      this.wishlistError = 'Please log in to add items to your wishlist.';
      return;
    }

    const user = this.authService.getSessionUser();
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;

    if (!user || !token) {
      this.wishlistError = 'Unable to add item to wishlist. Please log in again.';
      return;
    }

    this.wishlistLoading = { ...this.wishlistLoading, [product.id]: true };

    const request: AddProductToWhislist = {
      userId: user.userId,
      productId: product.id
    };

    this.wishlistService.addToWishlist(token, request).subscribe({
      next: result => {
        this.wishlistLoading = { ...this.wishlistLoading, [product.id]: false };
        if (result.isSuccess) {
          this.wishlistMessage = result.message || `Added “${product.name}” to wishlist.`;
          return;
        }
        this.wishlistError = result.message || 'Could not add item to wishlist.';
      },
      error: err => {
        this.wishlistLoading = { ...this.wishlistLoading, [product.id]: false };
        this.wishlistError = formatHttpError(err, 'Could not add item to wishlist');
      }
    });
  }
}
