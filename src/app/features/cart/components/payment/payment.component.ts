import { Component, OnInit, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutService } from '../../services/checkout.service';
import {
  loadStripe, Stripe,
  StripeCardNumberElement, StripeCardExpiryElement, StripeCardCvcElement,
  StripeElements
} from '@stripe/stripe-js';

const STRIPE_PK = 'pk_test_51QKAlHBSwoMv2En8Ryc4MY8nSzGlGG1p9mATUAFHAfTD1ye4wr8CC8oIgvZxICwSouS30uZgIV8YzketAFmtytVE00ZYRfd6ul';
const STRIPE_SK = 'sk_test_51QKAlHBSwoMv2En8lR83mfu0Z0Ht5N8Pw3ms0ZScfKYK8gqKEwwFvoTXWkn9OnplEBSXkGHbA7VW7L9GV5nn6AXN00uaRgcJ7u';

const STRIPE_STYLE = {
  style: {
    base: {
      color: '#2c2f31',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      fontSize: '15px',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#abadaf' },
      iconColor: '#0057bd',
    },
    invalid: { color: '#b31b25', iconColor: '#b31b25' },
  },
};

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit, AfterViewInit, OnDestroy {

  paymentForm: FormGroup;
  orderId        = '';
  isLoading      = false;
  isLoadingOrder = true;
  errorMessage   = '';
  paymentSuccess = false;

  orderNumber  = '';
  subTotal     = 0;
  shippingCost = 50;
  discount     = 0;
  totalAmount  = 0;

  /** Live display values for the animated card preview */
  displayCardNumber = '0000 0000 0000 0000';
  displayExpiry     = 'MM/YY';

  /** Track each Stripe field's completion so we can enable/disable Pay */
  cardNumberComplete = false;
  cardExpiryComplete = false;
  cardCvcComplete    = false;

  /** Per-field inline error messages from Stripe */
  cardNumberError = '';
  cardExpiryError = '';
  cardCvcError    = '';

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardNumber: StripeCardNumberElement | null = null;
  private cardExpiry: StripeCardExpiryElement | null = null;
  private cardCvc: StripeCardCvcElement | null = null;
  private destroyed = false;
  private pollId: any = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private checkoutService: CheckoutService,
    private ngZone: NgZone
  ) {
    this.paymentForm = this.fb.group({
      cardName: ['', Validators.required],
      saveCard: [false]
    });
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  async ngOnInit(): Promise<void> {
    this.stripe = await loadStripe(STRIPE_PK);
    this.route.params.subscribe(params => {
      this.orderId = params['orderId'];
      this.loadOrderData();
    });
  }

  ngAfterViewInit(): void {
    if (this.stripe) {
      this.mountElements();
    } else {
      this.pollId = setInterval(() => {
        if (this.stripe) {
          clearInterval(this.pollId);
          this.pollId = null;
          if (!this.destroyed) this.mountElements();
        }
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.pollId) { clearInterval(this.pollId); this.pollId = null; }
    this.cardNumber?.destroy();
    this.cardExpiry?.destroy();
    this.cardCvc?.destroy();
  }

  // ── Convenience getter used by template ──────────────────────────────────

  get stripeReady(): boolean {
    return this.cardNumberComplete && this.cardExpiryComplete && this.cardCvcComplete;
  }

  get canPay(): boolean {
    return !this.isLoading && this.paymentForm.valid && this.stripeReady;
  }

  // ── Stripe split-elements setup ──────────────────────────────────────────

  private mountElements(): void {
    if (!this.stripe) return;
    this.elements = this.stripe.elements();

    // ── Card Number ──────────────────────────────────────────────────────
    this.cardNumber = this.elements.create('cardNumber', {
      ...STRIPE_STYLE,
      placeholder: '0000 0000 0000 0000',
      showIcon: true,
    });
    this.cardNumber.mount('#stripe-card-number');
    this.cardNumber.on('change', (e) => {
      this.ngZone.run(() => {
        this.cardNumberComplete = e.complete;
        this.cardNumberError    = e.error?.message || '';
        // Stripe never exposes raw digits; mask when complete
        this.displayCardNumber = e.complete ? '●●●● ●●●● ●●●● ●●●●' : '0000 0000 0000 0000';
      });
    });

    // ── Card Expiry ──────────────────────────────────────────────────────
    this.cardExpiry = this.elements.create('cardExpiry', { ...STRIPE_STYLE });
    this.cardExpiry.mount('#stripe-card-expiry');
    this.cardExpiry.on('change', (e) => {
      this.ngZone.run(() => {
        this.cardExpiryComplete = e.complete;
        this.cardExpiryError    = e.error?.message || '';
        this.displayExpiry = e.complete ? '●●/●●' : 'MM/YY';
      });
    });

    // ── Card CVC ─────────────────────────────────────────────────────────
    this.cardCvc = this.elements.create('cardCvc', { ...STRIPE_STYLE });
    this.cardCvc.mount('#stripe-card-cvc');
    this.cardCvc.on('change', (e) => {
      this.ngZone.run(() => {
        this.cardCvcComplete = e.complete;
        this.cardCvcError    = e.error?.message || '';
      });
    });
  }

  // ── Order data ───────────────────────────────────────────────────────────

  private loadOrderData(): void {
    try {
      const stored = sessionStorage.getItem('lastOrder');
      if (stored) {
        const o = JSON.parse(stored);
        if (String(o.orderId) === String(this.orderId)) {
          this.orderNumber  = o.orderNumber  || this.orderId;
          this.subTotal     = o.subTotal     || 0;
          this.shippingCost = o.shippingCost || 50;
          this.discount     = o.discount     || 0;
          this.totalAmount  = o.totalAmount  || 0;
          this.isLoadingOrder = false;
          return;
        }
      }
    } catch { /* ignore */ }

    if (!this.orderId) { this.isLoadingOrder = false; return; }

    this.checkoutService.getOrder(this.orderId).subscribe({
      next: (res: any) => {
        this.isLoadingOrder = false;
        const d = res?.isSuccess ? res.data : (res?.data || res);
        if (d) {
          this.orderNumber  = d.orderNumber || this.orderId;
          this.subTotal     = d.subTotal    || 0;
          this.shippingCost = 50;
          this.discount     = d.discount    || 0;
          this.totalAmount  = this.subTotal + 50 - this.discount;
        }
      },
      error: () => { this.isLoadingOrder = false; }
    });
  }

  // ── Payment submission ───────────────────────────────────────────────────

  async processPayment(): Promise<void> {
    this.paymentForm.markAllAsTouched();
    if (!this.canPay) return;
    if (!this.stripe || !this.cardNumber) {
      this.errorMessage = 'Payment system not loaded. Please refresh the page.';
      return;
    }

    this.isLoading    = true;
    this.errorMessage = '';

    try {
      // Step 1 — tokenise via Stripe.js SDK (the only browser-compliant method)
      const { token, error: tokenError } = await this.stripe.createToken(this.cardNumber, {
        name: this.paymentForm.value.cardName,
      });
      if (tokenError || !token) {
        throw new Error(tokenError?.message || 'Card tokenisation failed.');
      }
      console.log('[Stripe] Token created:', token.id);

      // Step 2 — create PaymentIntent (demo: SK used client-side)
      const piBody =
        `amount=${Math.round(this.totalDue * 100)}` +
        `&currency=egp` +
        `&payment_method_types[]=card` +
        `&description=${encodeURIComponent('YallaShop Order #' + (this.orderNumber || this.orderId))}`;

      const piResp = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SK}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: piBody,
      });
      const piData = await piResp.json();
      if (!piResp.ok || piData.error) {
        throw new Error(piData.error?.message || `PaymentIntent failed (${piResp.status})`);
      }

      // Step 3 — confirm with token
      const { error: confirmError, paymentIntent } =
        await this.stripe.confirmCardPayment(piData.client_secret, {
          payment_method: {
            card: { token: token.id },
            billing_details: { name: this.paymentForm.value.cardName },
          },
        });

      if (confirmError) throw new Error(confirmError.message || 'Card confirmation failed.');
      if (paymentIntent?.status !== 'succeeded') {
        throw new Error(`Payment status: ${paymentIntent?.status}`);
      }

      // Step 4 — success
      this.ngZone.run(() => {
        this.isLoading      = false;
        this.paymentSuccess = true;

        try {
          const s = sessionStorage.getItem('lastOrder');
          if (s) {
            const o = JSON.parse(s);
            o.paymentMethod = 'Credit Card';
            o.paymentStatus = 'Paid';
            sessionStorage.setItem('lastOrder', JSON.stringify(o));
          }
        } catch { /* ignore */ }

        setTimeout(() => {
          this.router.navigate(['/order-confirmation'], {
            queryParams: { orderId: this.orderId }
          });
        }, 1500);
      });

    } catch (err: any) {
      this.ngZone.run(() => {
        this.isLoading    = false;
        this.errorMessage = err?.message || 'Payment failed. Please try again.';
        console.error('[Payment]', err);
      });
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  formatMoney(value: number | undefined): string {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency', currency: 'EGP', minimumFractionDigits: 2,
    }).format(value ?? 0);
  }

  get totalDue(): number { return this.totalAmount || 0; }

  goBack(): void { this.router.navigate(['/checkout']); }
}
