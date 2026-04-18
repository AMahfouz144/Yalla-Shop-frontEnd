import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartSummary } from '../../../core/models/cart.model';
import { PromoRequest, PromoResult } from '../../../core/models/promo.model';
import { ApiWrapper } from '../../../core/models/api-wrapper.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly base = 'https://yallashop-api.runasp.net/api';

  constructor(private http: HttpClient) {}

  getCart(): Observable<ApiWrapper<CartSummary>> {
    return this.http.get<ApiWrapper<CartSummary>>(`${this.base}/Cart/items`);
  }

  applyPromo(request: PromoRequest): Observable<ApiWrapper<PromoResult>> {
    return this.http.post<ApiWrapper<PromoResult>>(
      `${this.base}/promo/apply`,
      request
    );
  }

  removeItem(id: string): Observable<ApiWrapper<unknown>> {
    return this.http.delete<ApiWrapper<unknown>>(`${this.base}/cart/${id}`);
  }

  updateQuantity(
    id: string,
    quantity: number
  ): Observable<ApiWrapper<unknown>> {
    return this.http.put<ApiWrapper<unknown>>(`${this.base}/cart/${id}`, {
      quantity,
    });
  }
}
