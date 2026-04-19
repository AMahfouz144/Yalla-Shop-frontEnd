import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api-base';
import { ApiWrapper } from '../models/api-wrapper.model';
import { CartSummary } from '../models/cart.model';
import { PromoRequest, PromoResult } from '../models/promo.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly url = `${API_BASE_URL}/Cart/items`;
  private readonly promoUrl = `${API_BASE_URL}/promo/apply`;

  constructor(private readonly http: HttpClient) {}

  addItem(productId: number, quantity = 1): Observable<unknown> {
    return this.http.post(
      this.url,
      { productId, quantity },
      { withCredentials: true }
    );
  }

  getCart(): Observable<ApiWrapper<CartSummary>> {
    return this.http.get<ApiWrapper<CartSummary>>(this.url, {
      withCredentials: true
    });
  }

  applyPromo(request: PromoRequest): Observable<ApiWrapper<PromoResult>> {
    return this.http.post<ApiWrapper<PromoResult>>(this.promoUrl, request, {
      withCredentials: true
    });
  }

  removeItem(id: string): Observable<ApiWrapper<unknown>> {
    return this.http.delete<ApiWrapper<unknown>>(`${API_BASE_URL}/cart/${id}`, {
      withCredentials: true
    });
  }

  updateQuantity(id: string, quantity: number): Observable<ApiWrapper<unknown>> {
    return this.http.put<ApiWrapper<unknown>>(
      `${API_BASE_URL}/cart/${id}`,
      { quantity },
      { withCredentials: true }
    );
  }
}
