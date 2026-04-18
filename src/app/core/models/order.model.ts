export type PaymentMethod = 'Cash' | 'Stripe' | 'Wallet';

export interface CheckoutRequest {
  shippingAddressId: string;
  paymentMethod: PaymentMethod;
  promoCode?: string;
  guestEmail?: string;
}

export interface OrderResponse {
  orderId: string;
  orderNumber: string;
  subTotal: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  status: string;
  stripeClientSecret?: string;
}
