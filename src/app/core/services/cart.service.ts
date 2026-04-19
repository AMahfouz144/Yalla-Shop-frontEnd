import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api-base';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly url = `${API_BASE_URL}/Cart/items`;

  constructor(private readonly http: HttpClient) {}

  addItem(productId: number, quantity = 1): Observable<unknown> {
    return this.http.post(
      this.url,
      { productId, quantity },
      { withCredentials: true }
    );
  }
}
