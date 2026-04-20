import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { API_BASE_URL } from '../config/api-base';
import { ResponseModel } from '../Interfaces/response-model';
import { OrderResponseDto } from '../models/order-history.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  /** Maps to the [Route("api/orders")] controller on the backend. */
  private readonly apiUrl = `https://yallashop-api.runasp.net/api/orders`;

  constructor(private http: HttpClient) { }

  // ---------------------------------------------------------------------------
  // GET /api/orders/customer/{customerId}
  // Returns all orders placed by the given Identity User ID.
  // ---------------------------------------------------------------------------
  getOrdersByCustomer(customerId: string): Observable<ResponseModel<OrderResponseDto[]>> {
    return this.http
      .get<ResponseModel<OrderResponseDto[]>>(`${this.apiUrl}/customer/${customerId}`)
      .pipe(catchError(this.handleError));
  }

  // ---------------------------------------------------------------------------
  // GET /api/orders/seller/{sellerId}
  // Returns all orders that contain products belonging to the given seller ID.
  // ---------------------------------------------------------------------------
  getOrdersBySeller(sellerId: number): Observable<ResponseModel<OrderResponseDto[]>> {
    return this.http
      .get<ResponseModel<OrderResponseDto[]>>(`${this.apiUrl}/seller/${sellerId}`)
      .pipe(catchError(this.handleError));
  }

  // ---------------------------------------------------------------------------
  // Shared error handler — surfaces a friendly message and re-throws so callers
  // can subscribe to the error channel and display appropriate UI feedback.
  // ---------------------------------------------------------------------------
  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred. Please try again later.';

    if (error.status === 0) {
      // Network / CORS issue — server unreachable.
      message = 'Cannot reach the server. Please check your connection.';
    } else if (error.status === 401) {
      message = 'You must be logged in to view orders.';
    } else if (error.status === 403) {
      message = 'You do not have permission to view these orders.';
    } else if (error.status === 404) {
      message = 'No orders found for the specified account.';
    } else if (error.error?.message) {
      // Backend ResponseModel may include a message field on failure.
      message = error.error.message;
    }

    console.error('[OrderService]', error);
    return throwError(() => new Error(message));
  }
}
