import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CheckoutService } from '../../services/checkout.service';

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss'],
})
export class OrderConfirmationComponent implements OnInit {
  order: Record<string, unknown> | null = null;
  orderId = '';

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
    this.route.queryParams.subscribe((params) => {
      this.orderId = params['orderId'] ?? '';
      if (this.orderId) {
        this.loadOrder();
      }
    });
  }

  loadOrder(): void {
    this.checkoutService.getOrder(this.orderId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.order = res.data as Record<string, unknown>;
        }
      },
    });
  }

  getStepStatus(index: number): 'completed' | 'current' | 'upcoming' {
    const raw = String(this.order?.['status'] ?? 'Pending');
    const statusMap: Record<string, number> = {
      Pending: 0,
      Confirmed: 1,
      Shipped: 2,
      Delivered: 3,
      pending: 0,
      confirmed: 1,
      shipped: 2,
      delivered: 3,
    };
    const currentStep = statusMap[raw] ?? 0;
    if (index < currentStep) {
      return 'completed';
    }
    if (index === currentStep) {
      return 'current';
    }
    return 'upcoming';
  }

  get orderItems(): Array<Record<string, unknown>> {
    const o = this.order;
    if (!o) {
      return [];
    }
    const items = o['items'] ?? o['orderItems'] ?? o['lineItems'];
    return Array.isArray(items) ? (items as Array<Record<string, unknown>>) : [];
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
    const addr = this.order?.['shippingAddress'] as Record<string, unknown> | undefined;
    if (!addr) {
      const label = this.order?.['shippingAddressLabel'];
      if (typeof label === 'string' && label) {
        return [label];
      }
      return ['Address will appear here when available.'];
    }
    const parts = [
      addr['street'],
      addr['city'],
      addr['state'],
      addr['country'],
      addr['zipCode'],
    ]
      .map((p) => (typeof p === 'string' ? p : ''))
      .filter(Boolean);
    return parts.length ? parts : ['Address on file'];
  }
}
