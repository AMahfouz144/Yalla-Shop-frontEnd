import { Injectable } from '@angular/core';
import { ResponseModel } from '../Interfaces/response-model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AddProductToWhislist } from '../models/add-product-to-whislist';
import { WhislistResponse } from '../models/whislist-response';
@Injectable({
  providedIn: 'root'
})
export class WishlistServiceService {

  constructor(private http: HttpClient) { }
  private readonly apiUrl = `https://yallashop-api.runasp.net/api/Wishists`;

  addToWishlist(token:string, request: AddProductToWhislist): Observable<ResponseModel<WhislistResponse>> {
    return this.http.post<ResponseModel<WhislistResponse>>(`${this.apiUrl}`, request, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  getWishlist(token:string,userId:string): Observable<ResponseModel<WhislistResponse[]>> {
    return this.http.get<ResponseModel<WhislistResponse[]>>(`${this.apiUrl}/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  removeFromWishlist(token:string,productId: number): Observable<ResponseModel<boolean>> {
    return this.http.delete<ResponseModel<boolean>>(`${this.apiUrl}/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

}
