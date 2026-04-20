import { Injectable } from '@angular/core';
import { ResponseModel } from '../Interfaces/response-model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReviewResponse } from '../Interfaces/review-response';
import { ReviewRequest } from '../Interfaces/review-request';
import { UpdateReview } from '../Interfaces/update-review';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {

  constructor(private http: HttpClient) { }
  private readonly apiUrl = `https://yallashop-api.runasp.net/api/Review`;

  getProductRating(productId: number): Observable<ResponseModel<number>> {
    return this.http.get<ResponseModel<number>>(`${this.apiUrl}/product/${productId}/rating`);
  }
  getProductReviews(productId: number): Observable<ResponseModel<ReviewResponse[]>> {
    return this.http.get<ResponseModel<ReviewResponse[]>>(`${this.apiUrl}/product/${productId}`);
  }

  /**
   * Mutating calls require an authenticated user. The global `AuthInterceptor`
   * attaches `Authorization: Bearer <token>` from `localStorage` for all HttpClient requests.
   */
  addReview(review: ReviewRequest): Observable<ResponseModel<ReviewResponse>> {
    return this.http.post<ResponseModel<ReviewResponse>>(`${this.apiUrl}`, review);
  }
  updateReview(reviewId: number, review: UpdateReview): Observable<ResponseModel<boolean>> {
    return this.http.put<ResponseModel<boolean>>(`${this.apiUrl}/${reviewId}`, review);
  }
  deleteReview(reviewId: number): Observable<ResponseModel<boolean>> {
    return this.http.delete<ResponseModel<boolean>>(`${this.apiUrl}/${reviewId}`);
  }
}
