import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { OrderResponse } from '../../../../core/models/order.model';
import { CheckoutService } from '../../services/checkout.service';

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss'],
})
export class OrderConfirmationComponent implements OnInit {
  order: OrderResponse | null = null;
  orderId = '';
  isLoading = true;
  errorMessage = '';

  // From sessionStorage (reliable — contains correct payment method and amounts)
  storedPaymentMethod = '';
  storedPaymentStatus = '';
  storedSubTotal = 0;
  storedShippingCost = 50;
  storedDiscount = 0;
  storedTotalAmount = 0;
  storedOrderNumber = '';

  trackingSteps = [
    { label: 'Placed', icon: 'check' },
    { label: 'Processing', icon: 'settings' },
    { label: 'Shipped', icon: 'local_shipping' },
    { label: 'Delivered', icon: 'home' },
  ];

  constructor(
    private route: ActivatedRoute,
    private checkoutService: CheckoutService
  ) {}

  ngOnInit(): void {
    // Support orderId from route params
    this.route.params.subscribe((params) => {
      if (params['orderId']) {
        this.orderId = params['orderId'];
        this.loadStoredOrder();
        this.loadOrder();
      }
    });

    // Support orderId from query params
    this.route.queryParams.subscribe((params) => {
      if (params['orderId'] && !this.orderId) {
        this.orderId = params['orderId'];
        this.loadStoredOrder();
        this.loadOrder();
      }
    });

    setTimeout(() => {
      if (!this.orderId) {
        this.isLoading = false;
      }
    }, 500);
  }

  /** Load order info from sessionStorage (set by checkout/payment components) */
  private loadStoredOrder(): void {
    try {
      const stored = sessionStorage.getItem('lastOrder');
      if (stored) {
        const order = JSON.parse(stored);
        this.storedPaymentMethod = order.paymentMethod || '';
        this.storedPaymentStatus = order.paymentStatus || 'Pending';
        this.storedSubTotal = order.subTotal || 0;
        this.storedShippingCost = order.shippingCost || 50;
        this.storedDiscount = order.discount || 0;
        this.storedTotalAmount = order.totalAmount || 0;
        this.storedOrderNumber = order.orderNumber || '';
      }
    } catch (e) { /* ignore */ }
  }

  loadOrder(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.checkoutService.getOrder(this.orderId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const data = res?.isSuccess !== undefined ? res.data : res;
        if (data) {
          this.order = data;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  /** Get the actual payment method the user chose (not what backend stored) */
  get displayPaymentMethod(): string {
    return this.storedPaymentMethod || this.order?.paymentMethod || 'Cash on Delivery';
  }

  get displayPaymentStatus(): string {
    if (this.storedPaymentStatus) return this.storedPaymentStatus;
    return this.order?.paymentStatus || 'Pending';
  }

  get isCardPayment(): boolean {
    const pm = this.displayPaymentMethod.toLowerCase();
    return pm.includes('card') || pm.includes('credit') || pm.includes('stripe');
  }

  get displaySubTotal(): number {
    return this.storedSubTotal || this.num(this.order?.subTotal);
  }

  get displayShippingCost(): number {
    return this.storedShippingCost || 50;
  }

  get displayDiscount(): number {
    return this.storedDiscount || this.num(this.order?.discount);
  }

  get displayTotalAmount(): number {
    if (this.storedTotalAmount > 0) return this.storedTotalAmount;
    return this.num(this.order?.totalAmount) || (this.displaySubTotal + this.displayShippingCost - this.displayDiscount);
  }

  get displayOrderNumber(): string {
    return this.order?.orderNumber || this.storedOrderNumber || this.orderId;
  }

  getStepStatus(index: number): 'completed' | 'current' | 'upcoming' {
    const raw = this.order?.status || 'Pending';
    const statusMap: Record<string, number> = {
      Pending: 0, Confirmed: 1, Shipped: 2, Delivered: 3,
      pending: 0, confirmed: 1, shipped: 2, delivered: 3,
    };
    const currentStep = statusMap[raw] ?? 0;
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'upcoming';
  }

  get orderItems(): Array<Record<string, unknown>> {
    if (!this.order) return [];
    const o = this.order as any;
    const items = o.items || o.orderItems || o.lineItems;
    return Array.isArray(items) ? items : [];
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2,
    }).format(value);
  }

  num(val: unknown, fallback = 0): number {
    return typeof val === 'number' && !Number.isNaN(val) ? val : fallback;
  }

  shippingAddressLines(): string[] {
    const addr = this.order?.shippingAddress;
    if (!addr) {
      const label = (this.order as any)?.shippingAddressLabel;
      if (typeof label === 'string' && label) return [label];
      return ['Address will appear here when available.'];
    }
    const parts = [addr.street, addr.city, addr.state, addr.country, addr.zipCode]
      .map((p) => (typeof p === 'string' ? p : ''))
      .filter(Boolean);
    return parts.length ? parts : ['Address on file'];
  }
}
