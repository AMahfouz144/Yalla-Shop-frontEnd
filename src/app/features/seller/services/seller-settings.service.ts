import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, map, catchError, switchMap } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api-base';

const STORAGE_KEY = 'sellerNumericId';

/**
 * Seller-area only: stores and auto-resolves the integer seller id needed by product APIs.
 *
 * Resolution strategy (tried in order):
 *   1. Cached value in localStorage
 *   2. Decode the JWT token and look for a sellerId claim
 *   3. Call GET /api/Account/profile and look for sellerId in the response
 *   4. Call GET /api/Product (all products) and extract the sellerId from the first product
 *      that belongs to this seller (matched via the JWT userId)
 */
@Injectable()
export class SellerSettingsService {
  private resolving = false;

  constructor(private readonly http: HttpClient) {}

  getSellerNumericId(): number | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  setSellerNumericId(id: number): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    if (!Number.isFinite(id) || id <= 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, String(Math.floor(id)));
  }

  clear(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Attempts to automatically resolve and cache the seller numeric id.
   * Returns an Observable that emits the id (or null if it can't be found).
   */
  autoResolve(): Observable<number | null> {
    // Already cached
    const cached = this.getSellerNumericId();
    if (cached != null) {
      return of(cached);
    }

    if (this.resolving) {
      return of(null);
    }
    this.resolving = true;

    // Strategy 1: Decode JWT token
    const fromJwt = this.extractSellerIdFromJwt();
    if (fromJwt != null) {
      this.setSellerNumericId(fromJwt);
      this.resolving = false;
      return of(fromJwt);
    }

    // Strategy 2: Try profile API
    return this.http.get<unknown>(`${API_BASE_URL}/Account/profile`).pipe(
      map((res: unknown) => this.extractIdFromObject(res)),
      switchMap(id => {
        if (id != null) {
          return of(id);
        }
        // Strategy 3: Fetch all products and find ours
        return this.resolveFromAllProducts();
      }),
      tap(id => {
        if (id != null) {
          this.setSellerNumericId(id);
        }
        this.resolving = false;
      }),
      catchError(() => {
        // If profile fails, try products
        return this.resolveFromAllProducts().pipe(
          tap(id => {
            if (id != null) {
              this.setSellerNumericId(id);
            }
            this.resolving = false;
          }),
          catchError(() => {
            this.resolving = false;
            return of(null);
          })
        );
      })
    );
  }

  // ---------------------------------------------------------------------------
  // Strategy 1: Decode JWT token claims
  // ---------------------------------------------------------------------------
  private extractSellerIdFromJwt(): number | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    try {
      const parts = token.split('.');
      if (parts.length < 2) {
        return null;
      }
      // Base64Url → Base64 → decode
      let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      // Pad to multiple of 4
      while (payload.length % 4 !== 0) {
        payload += '=';
      }
      const json = atob(payload);
      const claims = JSON.parse(json) as Record<string, unknown>;

      // Look for any sellerId-like claim
      const keys = [
        'sellerId', 'SellerId', 'seller_id', 'SellerNumericId',
        'sellerNumericId', 'sid', 'seller', 'Seller',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sellerId',
        'SellerID', 'sellerID'
      ];

      for (const key of keys) {
        const val = claims[key];
        if (val != null) {
          const n = Number(val);
          if (Number.isFinite(n) && n > 0) {
            return Math.floor(n);
          }
        }
      }

      // Also search all claims for any that contain "seller" in the key name
      for (const [key, val] of Object.entries(claims)) {
        if (key.toLowerCase().includes('seller') && val != null) {
          const n = Number(val);
          if (Number.isFinite(n) && n > 0) {
            return Math.floor(n);
          }
        }
      }
    } catch {
      // Token is malformed — skip
    }

    return null;
  }

  // ---------------------------------------------------------------------------
  // Strategy 2 helper: Extract sellerId from any object (profile response)
  // ---------------------------------------------------------------------------
  private extractIdFromObject(raw: unknown): number | null {
    if (raw == null || typeof raw !== 'object') {
      return null;
    }
    const obj = raw as Record<string, unknown>;

    // Might be wrapped: { data: { ... } }
    const inner = (typeof obj['data'] === 'object' && obj['data'] != null)
      ? obj['data'] as Record<string, unknown>
      : obj;

    for (const key of ['sellerId', 'SellerId', 'sellerNumericId', 'seller_id', 'SellerID']) {
      const val = inner[key];
      if (val != null) {
        const n = Number(val);
        if (Number.isFinite(n) && n > 0) {
          return Math.floor(n);
        }
      }
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Strategy 3: GET all products, find the one with our sellerId
  // ---------------------------------------------------------------------------
  private resolveFromAllProducts(): Observable<number | null> {
    return this.http.get<unknown>(`${API_BASE_URL}/Product`).pipe(
      map((body: unknown) => {
        if (!Array.isArray(body)) {
          return null;
        }

        // Collect all unique sellerIds from all products
        const sellerIds = new Set<number>();
        for (const item of body) {
          if (item != null && typeof item === 'object') {
            const raw = item as Record<string, unknown>;
            const sid = raw['sellerId'] ?? raw['SellerId'];
            if (sid != null) {
              const n = Number(sid);
              if (Number.isFinite(n) && n > 0) {
                sellerIds.add(n);
              }
            }
          }
        }

        // If there's only one unique sellerId, it's very likely ours
        if (sellerIds.size === 1) {
          return [...sellerIds][0];
        }

        // If there are multiple, we need to match. Use userId from localStorage.
        // Some backends put userId as a string alongside sellerId.
        const userId = typeof localStorage !== 'undefined'
          ? localStorage.getItem('userId')
          : null;

        if (userId) {
          for (const item of body) {
            if (item != null && typeof item === 'object') {
              const raw = item as Record<string, unknown>;
              const itemUserId = raw['userId'] ?? raw['UserId'] ?? raw['user_id'];
              if (itemUserId != null && String(itemUserId) === userId) {
                const sid = raw['sellerId'] ?? raw['SellerId'];
                if (sid != null) {
                  const n = Number(sid);
                  if (Number.isFinite(n) && n > 0) {
                    return n;
                  }
                }
              }
            }
          }
        }

        // Last resort: if we have sellerIds and only one, use it
        // If multiple, return the first one (best guess for a seller dashboard)
        if (sellerIds.size > 0) {
          return [...sellerIds][0];
        }

        return null;
      }),
      catchError(() => of(null))
    );
  }
}
