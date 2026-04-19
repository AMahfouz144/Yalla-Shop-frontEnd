import { ShippingAddressDto } from './shipping-address.model';

export type PaymentMethod = 'Cash' | 'Stripe' | 'Wallet';

export interface CheckoutRequest {
  shippingAddressId: number;
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
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: ShippingAddressDto;
  stripeClientSecret?: string;
}
