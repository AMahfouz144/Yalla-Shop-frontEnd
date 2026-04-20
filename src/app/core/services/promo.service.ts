import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api-base';

export interface CreatePromoRequest {
  code: string;
  discountType: 'Percentage' | 'FixedAmount';
  discountValue: number;
  minOrderAmount: number;
  maxUsageCount: number;
  startDate: string; // ISO DateTime Format
  endDate: string; // ISO DateTime Format
}

export interface PromoResponse {
  isSuccess: boolean;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PromoService {
  private readonly baseUrl = `${API_BASE_URL}/promo`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Creates a new promo code via the backend.
   * Assumes HTTP interceptor appends authorization bearer tokens automatically.
   */
  createPromo(data: CreatePromoRequest): Observable<PromoResponse> {
    return this.http.post<PromoResponse>(this.baseUrl, data);
  }
}
