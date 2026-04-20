import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartItem, CartSummary } from '../../../../core/models/cart.model';
import { PromoResult } from '../../../../core/models/promo.model';
import { CartService } from '../../../../core/services/cart.service';
import { ProductService } from '../../../product/services/product.service';
import { API_ORIGIN } from '../../../../core/config/api-base';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit, OnDestroy {
  private static readonly IMAGE_PLACEHOLDER =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
        <rect width="320" height="320" fill="#f3f4f6"/>
        <path d="M74 226l53-64 43 48 33-39 43 55H74z" fill="#d1d5db"/>
        <circle cx="122" cy="111" r="22" fill="#e5e7eb"/>
      </svg>`
    );
  cart: CartSummary | null = null;
  promoCode = '';
  promoResult: PromoResult | null = null;
  loading = false;
  updating = false;
  errorMessage = '';
  promoError = '';
  private cartSub: Subscription | null = null;

  constructor(
    private readonly cartService: CartService,
    private readonly productService: ProductService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.cartSub = this.cartService.cart$.subscribe(c => (this.cart = c));
    this.loadCart();
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }

  loadCart(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cartService.getCart().subscribe({
      next: res => {
        this.loading = false;
        if (res.isSuccess && res.data?.items) {
          console.log('[Cart] items payload:', res.data.items);
          this.enrichCartItemImages(res.data.items);
        }
        if (!res.isSuccess) {
          this.errorMessage = res.message || 'Failed to load cart items.';
        }
      },
      error: () => {
        this.loading = false;
        this.cart = null;
        this.errorMessage = 'Failed to load cart items.';
      }
    });
  }

  /**
   * Enrich cart items with imageUrl from the Product API.
   * If the Cart API doesn't return imageUrl, we fetch all products
   * and map their imageUrl onto the corresponding cart items.
   */
  private enrichCartItemImages(items: CartItem[]): void {
    const itemsMissingImage = items.filter(item => !item.imageUrl);
    if (itemsMissingImage.length === 0) {
      // All items already have imageUrl — no enrichment needed
      return;
    }

    this.productService.filter({}).subscribe({
      next: products => {
        const imageMap = new Map<string, string>();
        for (const p of products) {
          if (p.imageUrl) {
            imageMap.set(String(p.id), p.imageUrl);
          }
        }

        // Enrich cart items that are missing imageUrl
        for (const item of items) {
          if (!item.imageUrl) {
            const productImage = imageMap.get(String(item.productId));
            if (productImage) {
              item.imageUrl = productImage;
            }
          }
        }
        console.log('[Cart] enriched items with images:', items);
      },
      error: err => {
        console.warn('[Cart] Could not fetch products for image enrichment:', err);
      }
    });
  }

  updateQuantity(item: CartItem, delta: number): void {
    const nextQuantity = item.quantity + delta;
    if (nextQuantity < 1 || this.updating) {
      return;
    }

    this.updating = true;
    this.cartService.updateQuantity(item.id, nextQuantity).subscribe({
      next: res => {
        if (!res.isSuccess) {
          this.errorMessage = res.message || 'Could not update item quantity.';
        }
        this.updating = false;
        this.loadCart();
      },
      error: () => {
        this.updating = false;
        this.errorMessage = 'Could not update item quantity.';
      }
    });
  }

  removeItem(itemId: string): void {
    if (this.updating) {
      return;
    }

    this.updating = true;
    this.cartService.removeItem(itemId).subscribe({
      next: res => {
        if (!res.isSuccess) {
          this.errorMessage = res.message || 'Could not remove item from cart.';
        }
        this.updating = false;
        this.loadCart();
      },
      error: () => {
        this.updating = false;
        this.errorMessage = 'Could not remove item from cart.';
      }
    });
  }

  applyPromo(): void {
    const code = this.promoCode.trim();
    if (!code) {
      this.promoError = 'Enter a promo code first.';
      return;
    }

    this.promoError = '';
    this.cartService.applyPromo({ code }).subscribe({
      next: res => {
        if (res.isSuccess && res.data) {
          this.promoResult = res.data;
          this.loadCart();
          return;
        }

        this.promoResult = null;
        this.promoError = res.message || 'Invalid promo code.';
      },
      error: () => {
        this.promoResult = null;
        this.promoError = 'Invalid promo code.';
      }
    });
  }

  goToCheckout(): void {
    void this.router.navigate(['/checkout']);
  }

  formatMoney(value: number | undefined | null): string {
    const amount = typeof value === 'number' ? value : 0;
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  get hasItems(): boolean {
    return !!this.cart?.items?.length;
  }

  getFullImageUrl(url: string | null | undefined): string {
    if (!url) {
      return CartComponent.IMAGE_PLACEHOLDER;
    }

    const normalized = String(url).trim().replace(/\\/g, '/');
    if (!normalized) {
      return CartComponent.IMAGE_PLACEHOLDER;
    }

    if (
      normalized.startsWith('http://') ||
      normalized.startsWith('https://') ||
      normalized.startsWith('data:') ||
      normalized.startsWith('blob:')
    ) {
      return normalized;
    }

    const withLeadingSlash = normalized.startsWith('/') ? normalized : `/${normalized}`;
    return `${API_ORIGIN}${withLeadingSlash}`;
  }

  onItemImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img) {
      return;
    }
    img.src = CartComponent.IMAGE_PLACEHOLDER;
  }

  get finalTotal(): number {
    if (!this.cart) {
      return 0;
    }

    const total = this.cart.totalAmount || 0;
    const discount = this.promoResult?.discount || this.cart.discount || 0;
    return Math.max(0, total - (this.promoResult ? this.promoResult.discount : 0));
  }
}
