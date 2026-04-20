import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckoutRequest, OrderResponse } from '../../../core/models/order.model';
import { ApiWrapper } from '../../../core/models/api-wrapper.model';
import { CreateShippingAddressDto, ShippingAddressDto } from '../../../core/models/shipping-address.model';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly base = 'https://yallashop-api.runasp.net/api';

  constructor(private http: HttpClient) {}

  getAddresses(): Observable<ApiWrapper<ShippingAddressDto[]>> {
    return this.http.get<ApiWrapper<ShippingAddressDto[]>>(`${this.base}/shipping-address`);
  }

  createAddress(address: CreateShippingAddressDto): Observable<ApiWrapper<ShippingAddressDto>> {
    return this.http.post<ApiWrapper<ShippingAddressDto>>(`${this.base}/shipping-address`, address);
  }

  placeOrder(
    request: CheckoutRequest
  ): Observable<ApiWrapper<OrderResponse>> {
    return this.http.post<ApiWrapper<OrderResponse>>(
      `${this.base}/checkout`,
      request
    );
  }

  /** Get order by ID — matches GET /api/Orders/{id} (integer ID) */
  getOrder(orderId: string | number): Observable<ApiWrapper<OrderResponse>> {
    return this.http.get<ApiWrapper<OrderResponse>>(
      `${this.base}/Orders/${orderId}`
    );
  }

  /**
   * Confirm payment for a Stripe order.
   * Note: The real Stripe flow uses webhooks (POST /api/payment/webhook).
   * For the ITI project demo, this is a best-effort call that may 404.
   * The payment component handles the fallback gracefully.
   */
  confirmPayment(orderId: string | number, paymentDetails: any): Observable<ApiWrapper<unknown>> {
    return this.http.post<ApiWrapper<unknown>>(
      `${this.base}/Orders/${orderId}/status`,
      1 // 1 = Confirmed status in the OrderStatus enum
    );
  }
}
