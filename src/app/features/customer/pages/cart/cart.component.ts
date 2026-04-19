import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartItem, CartSummary } from '../../../../core/models/cart.model';
import { PromoResult } from '../../../../core/models/promo.model';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cart: CartSummary | null = null;
  promoCode = '';
  promoResult: PromoResult | null = null;
  loading = false;
  updating = false;
  errorMessage = '';
  promoError = '';

  constructor(
    private readonly cartService: CartService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cartService.getCart().subscribe({
      next: res => {
        this.loading = false;
        if (res.isSuccess && res.data) {
          this.cart = res.data;
          return;
        }

        this.cart = null;
        this.errorMessage = res.message || 'Failed to load cart items.';
      },
      error: () => {
        this.loading = false;
        this.cart = null;
        this.errorMessage = 'Failed to load cart items.';
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

  formatMoney(value: number): string {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2,
    }).format(value);
  }

  get hasItems(): boolean {
    return !!this.cart?.items?.length;
  }

  get finalTotal(): number {
    if (!this.cart) {
      return 0;
    }

    return this.cart.total - (this.promoResult?.discount ?? 0);
  }
}
