import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckoutRequest, OrderResponse } from '../../../core/models/order.model';
import { ApiWrapper } from '../../../core/models/api-wrapper.model';
import { ShippingAddressDto } from '../../../core/models/shipping-address.model';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly base = 'https://yallashop-api.runasp.net/api';

  constructor(private http: HttpClient) {}

  getAddresses(): Observable<ApiWrapper<ShippingAddressDto[]>> {
    return this.http.get<ApiWrapper<ShippingAddressDto[]>>(`${this.base}/shipping-address`);
  }

  placeOrder(
    request: CheckoutRequest
  ): Observable<ApiWrapper<OrderResponse>> {
    return this.http.post<ApiWrapper<OrderResponse>>(
      `${this.base}/checkout`,
      request
    );
  }

  getOrder(orderId: string): Observable<ApiWrapper<OrderResponse>> {
    return this.http.get<ApiWrapper<OrderResponse>>(
      `${this.base}/orders/${orderId}`
    );
  }
}
