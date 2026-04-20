import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartSummary, CartItem } from '../../../../core/models/cart.model';
import {
  CheckoutRequest,
  PaymentMethod,
} from '../../../../core/models/order.model';
import { PromoResult } from '../../../../core/models/promo.model';
import { CreateShippingAddressDto, ShippingAddressDto } from '../../../../core/models/shipping-address.model';
import { CartService } from '../../../../core/services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  cart: CartSummary | null = null;
  addressForm: FormGroup;
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
    { value: 'Stripe', label: 'Credit/Debit Card', icon: 'credit_card' },
  ];

  constructor(
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.addressForm = this.fb.group({
      label: ['Home', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['Egypt', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{5,10}$')]],
      isDefault: [true]
    });
  }

  ngOnInit(): void {
    this.loadCart();
    this.loadAddresses();
  }

  loadCart(): void {
    this.errorMessage = '';
    this.cartService.getCart().subscribe({
      next: (res) => {
        if (res.isSuccess) {
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

    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      this.errorMessage = 'Please complete your shipping address';
      return;
    }
    if (this.isGuestCheckout && !this.guestEmail.trim()) {
      this.errorMessage = 'Please enter your email for guest checkout';
      return;
    }

    this.isLoading = true;
    
    // Step 1: Create Address first
    const addressData: CreateShippingAddressDto = this.addressForm.value;
    
    this.checkoutService.createAddress(addressData).subscribe({
      next: (addrRes) => {
        if (addrRes.isSuccess && addrRes.data) {
          this.executeCheckout(addrRes.data.id);
        } else {
          this.isLoading = false;
          this.errorMessage = addrRes.message || 'Failed to save address';
          if (addrRes.errors?.length) {
            this.errorMessage += ': ' + addrRes.errors.join(', ');
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.message || err?.message || 'Address creation failed';
        this.errorMessage = `Address Error: ${msg}. Please check your inputs.`;
      }
    });
  }

  private executeCheckout(addressId: number): void {
    // IMPORTANT: Always send 'Cash' to the backend because the Stripe secret key
    // is not configured on the server. We handle the card payment UI on the frontend.
    const request: CheckoutRequest = {
      shippingAddressId: addressId,
      paymentMethod: 'Cash', // Always Cash for backend - Stripe key not configured
      promoCode: this.promoResult?.code || undefined,
      guestEmail: this.isGuestCheckout ? this.guestEmail.trim() : undefined,
    };

    this.checkoutService.placeOrder(request).subscribe({
      next: (res) => {
        this.isLoading = false;
        
        if (res.isSuccess && res.data) {
          this.handleOrderSuccess(res.data);
        } else {
          this.errorMessage = res.message || 'Order could not be placed';
          if (res.errors?.length) {
            this.errorMessage += ': ' + res.errors.join(', ');
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Checkout error:', err);
        
        let detail = '';
        if (err.error?.errors) {
          const errors = err.error.errors;
          if (typeof errors === 'object' && !Array.isArray(errors)) {
            detail = Object.keys(errors)
              .map(key => `${key}: ${Array.isArray(errors[key]) ? errors[key].join(', ') : errors[key]}`)
              .join(' | ');
          } else if (Array.isArray(errors)) {
            detail = errors.join(', ');
          }
        } else if (err.error?.message) {
          detail = err.error.message;
        } else {
          detail = err.message || 'Server error';
        }

        this.errorMessage = `Order Failed: ${detail}`;
      },
    });
  }

  private handleOrderSuccess(orderData: any): void {
    const orderId = orderData.orderId || orderData.id || orderData.Id;

    if (!orderId) {
      this.errorMessage = 'Order was placed but no order ID was returned.';
      return;
    }

    // Store order data + cart data in sessionStorage so payment/confirmation pages can access it
    const orderInfo = {
      orderId: String(orderId),
      orderNumber: orderData.orderNumber || orderData.OrderNumber || String(orderId),
      subTotal: this.cart?.subTotal || 0,
      shippingCost: this.cart?.shippingCost || 50,
      discount: this.cart?.discount || 0,
      totalAmount: this.finalTotal,
      paymentMethod: this.selectedPayment === 'Stripe' ? 'Credit Card' : 'Cash on Delivery',
      paymentMethodRaw: this.selectedPayment,
    };
    sessionStorage.setItem('lastOrder', JSON.stringify(orderInfo));

    if (this.selectedPayment === 'Stripe') {
      // Credit/Debit Card → redirect to payment page
      this.router.navigate(['/payment', orderId]);
    } else {
      // Cash on Delivery → redirect straight to order confirmation
      this.router.navigate(['/order-confirmation'], {
        queryParams: { orderId: String(orderId) },
      });
    }
  }

  get finalTotal(): number {
    if (!this.cart) {
      return 0;
    }
    const sub = this.cart.subTotal || 0;
    const ship = this.cart.shippingCost || 50;
    const disc = this.promoResult?.discount ?? this.cart.discount ?? 0;
    return Math.max(0, sub + ship - disc);
  }

  get subTotalWithoutPromo(): number {
    return this.cart?.subTotal || 0;
  }

  formatMoney(value: number | undefined | null): string {
    const amount = typeof value === 'number' ? value : 0;
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  addressLabel(addr: ShippingAddressDto): string {
    const line1 = addr.street || '';
    const city = addr.city || '';
    return [line1, city].filter(Boolean).join(', ') || 'Address';
  }
}
