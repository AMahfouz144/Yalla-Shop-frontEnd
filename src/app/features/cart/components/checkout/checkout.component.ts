import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartSummary, CartItem } from '../../../../core/models/cart.model';
import {
  CheckoutRequest,
  PaymentMethod,
} from '../../../../core/models/order.model';
import { PromoResult } from '../../../../core/models/promo.model';
import { ShippingAddressDto } from '../../../../core/models/shipping-address.model';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  cart: CartSummary | null = null;
  addresses: ShippingAddressDto[] = [];
  selectedAddressId: number | '' = '';
  selectedPayment: PaymentMethod = 'Cash';
  promoCode = '';
  promoResult: PromoResult | null = null;
  promoError = '';
  isGuestCheckout = false;
  guestEmail = '';
  isLoading = false;
  errorMessage = '';

  paymentMethods: Array<{
    value: PaymentMethod;
    label: string;
    icon: string;
  }> = [
    { value: 'Cash', label: 'Cash on Delivery', icon: 'local_shipping' },
    { value: 'Stripe', label: 'Credit Card', icon: 'credit_card' },
    { value: 'Wallet', label: 'Wallet', icon: 'account_balance_wallet' },
  ];

  constructor(
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
    this.loadAddresses();
  }

  loadCart(): void {
    this.errorMessage = '';
    this.cartService.getCart().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.cart = res.data;
        } else {
          this.errorMessage = res.message || 'Failed to load cart';
        }
      },
      error: () => {
        this.errorMessage = 'Failed to load cart';
      },
    });
  }

  loadAddresses(): void {
    this.checkoutService.getAddresses().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.addresses = res.data;
          const def = this.addresses.find((a) => a.isDefault === true);
          if (def && typeof def.id === 'number') {
            this.selectedAddressId = def.id;
          }
        }
      },
      error: () => {
        this.addresses = [];
      },
    });
  }

  applyPromo(): void {
    this.promoError = '';
    this.cartService.applyPromo({ code: this.promoCode.trim() }).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.promoResult = res.data;
          this.loadCart();
        } else {
          this.promoError = res.message || 'Invalid promo code';
        }
      },
      error: () => {
        this.promoError = 'Invalid promo code';
      },
    });
  }

  updateQuantity(item: CartItem, delta: number): void {
    const next = item.quantity + delta;
    if (next < 1) {
      return;
    }
    this.cartService.updateQuantity(item.id, next).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.loadCart();
        }
      },
    });
  }

  removeItem(id: string): void {
    this.cartService.removeItem(id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.loadCart();
        }
      },
    });
  }

  placeOrder(): void {
    this.errorMessage = '';

    if (!this.isGuestCheckout && !this.selectedAddressId) {
      this.errorMessage = 'Please select a shipping address';
      return;
    }
    if (this.isGuestCheckout && !this.guestEmail.trim()) {
      this.errorMessage = 'Please enter your email for guest checkout';
      return;
    }

    this.isLoading = true;
    const request: CheckoutRequest = {
      shippingAddressId: Number(this.selectedAddressId),
      paymentMethod: this.selectedPayment,
      promoCode: this.promoResult?.code,
      guestEmail: this.isGuestCheckout ? this.guestEmail.trim() : undefined,
    };

    this.checkoutService.placeOrder(request).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess && res.data?.orderId) {
          this.router.navigate(['/order-confirmation'], {
            queryParams: { orderId: res.data.orderId },
          });
        } else {
          this.errorMessage = res.message || 'Order could not be placed';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Order failed. Please try again.';
      },
    });
  }

  get finalTotal(): number {
    if (!this.cart) {
      return 0;
    }
    return this.cart.total - (this.promoResult?.discount ?? 0);
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2,
    }).format(value);
  }

  addressLabel(addr: ShippingAddressDto): string {
    const line1 = addr.street || '';
    const city = addr.city || '';
    return [line1, city].filter(Boolean).join(', ') || 'Address';
  }
}
