import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckoutRequest, OrderResponse } from '../../../core/models/order.model';
import { ApiWrapper } from '../../../core/models/api-wrapper.model';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly base = 'https://yallashop-api.runasp.net/api';

  constructor(private http: HttpClient) {}

  getAddresses(): Observable<ApiWrapper<unknown[]>> {
    return this.http.get<ApiWrapper<unknown[]>>(`${this.base}/Address`);
  }

  placeOrder(
    request: CheckoutRequest
  ): Observable<ApiWrapper<OrderResponse>> {
    return this.http.post<ApiWrapper<OrderResponse>>(
      `${this.base}/checkout`,
      request
    );
  }

  getOrder(orderId: string): Observable<ApiWrapper<unknown>> {
    return this.http.get<ApiWrapper<unknown>>(
      `${this.base}/orders/${orderId}`
    );
  }
}
