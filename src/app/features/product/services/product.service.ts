import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PRODUCT_API_ROOT } from '../apis/product-api.paths';
import { Product, ProductFilterParams } from '../models/product.model';
import { mapProductDto, mapProductList } from '../utils/product-dto.mapper';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<unknown>(PRODUCT_API_ROOT).pipe(map(body => mapProductList(body)));
  }

  getById(id: number): Observable<Product> {
    return this.http.get<unknown>(`${PRODUCT_API_ROOT}/${id}`).pipe(map(body => mapProductDto(body as Record<string, unknown>)));
  }

  /**
   * Query names use PascalCase to match ASP.NET's ProductFilterDto.
   */
  filter(params: ProductFilterParams): Observable<Product[]> {
    let httpParams = new HttpParams();
    const entries: [string, string | number | null | undefined][] = [
      ['Name', params.name],
      ['Description', params.description],
      ['MinPrice', params.minPrice],
      ['MaxPrice', params.maxPrice],
      ['StockQuantity', params.stockQuantity],
      ['CategoryName', params.categoryName],
      ['CreatedFrom', params.createdFrom],
      ['CreatedTo', params.createdTo],
      ['SortBy', params.sortBy],
      ['SortOrder', params.sortOrder]
    ];
    for (const [key, value] of entries) {
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return this.http
      .get<unknown>(`${PRODUCT_API_ROOT}/filter`, { params: httpParams })
      .pipe(map(body => mapProductList(body)));
  }

  /** `GET .../GetProductsofSellerid/{seller_id}` (authorized Seller). */
  getProductsForSeller(sellerId: number): Observable<Product[]> {
    return this.http
      .get<unknown>(`${PRODUCT_API_ROOT}/GetProductsofSellerid/${sellerId}`)
      .pipe(map(body => mapProductList(body)));
  }

  createFromForm(formData: FormData): Observable<Product> {
    return this.http.post<unknown>(PRODUCT_API_ROOT, formData).pipe(map(body => mapProductDto(body as Record<string, unknown>)));
  }

  updateFromForm(productId: number, formData: FormData): Observable<Product> {
    return this.http
      .put<unknown>(`${PRODUCT_API_ROOT}/${productId}`, formData)
      .pipe(map(body => mapProductDto(body as Record<string, unknown>)));
  }

  delete(productId: number): Observable<unknown> {
    return this.http.delete<unknown>(`${PRODUCT_API_ROOT}/${productId}`);
  }
}
