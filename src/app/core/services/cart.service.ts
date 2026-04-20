import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../config/api-base';
import { ApiWrapper } from '../models/api-wrapper.model';
import { CartSummary } from '../models/cart.model';
import { PromoRequest, PromoResult } from '../models/promo.model';
import { mapCartSummary } from '../utils/cart-mapper';
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly cartSubject = new BehaviorSubject<CartSummary | null>(null);
  /** Observable of the current cart state */
  readonly cart$ = this.cartSubject.asObservable();

  private readonly base = `${API_BASE_URL}/Cart`;
  // Note: Ensure your Swagger actually has a /promo endpoint,
  // as it's not visible in the screenshot.
  private readonly promoUrl = `${API_BASE_URL}/promo/apply`;

  constructor(private readonly http: HttpClient) {}

  // ✅ Correct
  getCart(): Observable<ApiWrapper<CartSummary>> {
    return this.http.get<ApiWrapper<CartSummary>>(this.base).pipe(
      map(res => {
        if (res.isSuccess) {
          res.data = mapCartSummary(res.data);
        }
        return res;
      }),
      tap(res => {
        if (res.isSuccess && res.data) {
          this.cartSubject.next(res.data);
        }
      })
    );
  }

  // ✅ Correct: Matches POST /api/Cart/items
  addItem(productId: number, quantity = 1): Observable<ApiWrapper<unknown>> {
    return this.http.post<ApiWrapper<unknown>>(`${this.base}/items`, {
      productId,
      quantity,
    }).pipe(
      tap(res => {
        if (res.isSuccess) {
          this.getCart().subscribe();
        }
      })
    );
  }

  // ⚠️ Fixed: Added /items/ to match Swagger /api/Cart/items/{cartItemId}
  removeItem(id: string | number): Observable<ApiWrapper<unknown>> {
    return this.http.delete<ApiWrapper<unknown>>(`${this.base}/items/${id}`).pipe(
      tap(res => {
        if (res.isSuccess) {
          this.getCart().subscribe();
        }
      })
    );
  }

  // ⚠️ Fixed: Added /items/ to match Swagger /api/Cart/items/{cartItemId}
  updateQuantity(
    id: string | number,
    quantity: number
  ): Observable<ApiWrapper<unknown>> {
    return this.http.put<ApiWrapper<unknown>>(`${this.base}/items/${id}`, {
      quantity,
    }).pipe(
      tap(res => {
        if (res.isSuccess) {
          this.getCart().subscribe();
        }
      })
    );
  }

  // ✅ Keep as is if the Promo controller exists elsewhere
  applyPromo(request: PromoRequest): Observable<ApiWrapper<PromoResult>> {
    return this.http.post<ApiWrapper<PromoResult>>(this.promoUrl, request).pipe(
      tap(res => {
        if (res.isSuccess) {
          this.getCart().subscribe();
        }
      })
    );
  }
   addToCart(productId: number, quantity: number): Observable<ApiWrapper<unknown>> {
    return this.http.post<ApiWrapper<unknown>>(`${this.base}/cart`, {
      productId,
      quantity,
    });
  }
}
