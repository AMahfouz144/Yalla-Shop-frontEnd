import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, delay, map, of, throwError } from 'rxjs';
import { ResponseModel } from '../../../core/Interfaces/response-model';
import { createAdminMockState, createMockSellers } from '../mock/admin-dashboard.mock-data';
import {
  AdminCategory,
  AdminDashboardSummary,
  AdminProduct,
  AdminSeller,
  AdminUser,
  ProductStatus,
  SellerApprovalStatus
} from '../models/admin.models';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private readonly adminApiUrl = 'https://yallashop-api.runasp.net/api/admin';
  private readonly fallbackLatencyMs = 250;

  private usersState: AdminUser[];
  private categoriesState: AdminCategory[];

  constructor(private readonly http: HttpClient) {
    const initialState = createAdminMockState();
    this.usersState = initialState.users;
    this.categoriesState = initialState.categories;
  }

  getSummary(): Observable<AdminDashboardSummary> {
    return this.http.get<ResponseModel<AdminDashboardSummary>>(`${this.adminApiUrl}/dashboard/summary`).pipe(
      map((response) => response.data),
      catchError(() => this.mockResponse(this.buildSummary()))
    );
  }

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<ResponseModel<AdminUser[]>>(`${this.adminApiUrl}/users`).pipe(
      map((response) => response.data),
      catchError(() => this.mockResponse(this.clone(this.usersState)))
    );
  }

  getSellers(): Observable<AdminSeller[]> {
    return this.http.get<ResponseModel<AdminSeller[]>>(`${this.adminApiUrl}/sellers`).pipe(
      map((response) => response.data),
      catchError(() => this.mockResponse(this.buildSellers()))
    );
  }

  getCategoriesWithProducts(): Observable<AdminCategory[]> {
    return this.http.get<ResponseModel<AdminCategory[]>>(`${this.adminApiUrl}/categories-with-products`).pipe(
      map((response) => response.data),
      catchError(() => this.mockResponse(this.clone(this.categoriesState)))
    );
  }

  getProducts(): Observable<AdminProduct[]> {
    return this.getCategoriesWithProducts().pipe(
      map((categories) => categories.flatMap((category) => category.products))
    );
  }

  toggleUserStatus(userId: string): Observable<boolean> {
    return this.http.put<ResponseModel<boolean>>(`${this.adminApiUrl}/users/${userId}/toggle-status`, {}).pipe(
      map((response) => response.data),
      catchError(() => {
        const user = this.usersState.find((item) => item.id === userId);
        if (!user) {
          return throwError(() => new Error('User not found.'));
        }

        user.isActive = !user.isActive;
        return this.mockResponse(true);
      })
    );
  }

  updateSellerApproval(userId: string, status: SellerApprovalStatus): Observable<AdminSeller> {
    const seller = this.usersState.find((item): item is AdminSeller => item.id === userId && item.role === 'Seller');
    if (!seller) {
      return throwError(() => new Error('Seller not found.'));
    }

    seller.sellerApprovalStatus = status;
    seller.isActive = status === 'Approved' ? true : seller.isActive;

    if (status === 'Rejected') {
      seller.isActive = false;
    }

    const hydratedSeller = this.buildSellers().find((item) => item.id === userId);
    if (!hydratedSeller) {
      return throwError(() => new Error('Seller not found.'));
    }

    return this.mockResponse(this.clone(hydratedSeller));
  }

  acceptProduct(productId: string): Observable<AdminProduct> {
    return this.updateProductStatus(productId, 'Accepted', `${this.adminApiUrl}/products/${productId}/accept`);
  }

  rejectProduct(productId: string): Observable<AdminProduct> {
    return this.updateProductStatus(productId, 'Rejected', `${this.adminApiUrl}/products/${productId}/reject`);
  }

  deleteProduct(productId: string): Observable<boolean> {
    return this.http.delete<ResponseModel<boolean>>(`${this.adminApiUrl}/products/${productId}`).pipe(
      map((response) => response.data),
      catchError(() => {
        let wasDeleted = false;

        this.categoriesState = this.categoriesState.map((category) => {
          const nextProducts = category.products.filter((product) => product.id !== productId);
          if (nextProducts.length !== category.products.length) {
            wasDeleted = true;
          }

          return {
            ...category,
            products: nextProducts
          };
        });

        if (!wasDeleted) {
          return throwError(() => new Error('Product not found.'));
        }

        return this.mockResponse(true);
      })
    );
  }

  private updateProductStatus(productId: string, status: ProductStatus, endpoint: string): Observable<AdminProduct> {
    return this.http.put<ResponseModel<AdminProduct>>(endpoint, {}).pipe(
      map((response) => response.data),
      catchError(() => {
        const product = this.findProduct(productId);
        if (!product) {
          return throwError(() => new Error('Product not found.'));
        }

        product.status = status;
        return this.mockResponse(this.clone(product));
      })
    );
  }

  private buildSummary(): AdminDashboardSummary {
    const products = this.categoriesState.flatMap((category) => category.products);
    const sellers = this.buildSellers();

    return {
      totalUsers: this.usersState.length,
      totalSellers: sellers.length,
      totalCategories: this.categoriesState.length,
      totalProducts: products.length,
      pendingProducts: products.filter((product) => product.status === 'Pending').length,
      disabledUsers: this.usersState.filter((user) => !user.isActive).length,
      pendingSellers: sellers.filter((seller) => seller.sellerApprovalStatus === 'Pending').length
    };
  }

  private buildSellers(): AdminSeller[] {
    return createMockSellers(this.usersState, this.categoriesState);
  }

  private findProduct(productId: string): AdminProduct | undefined {
    for (const category of this.categoriesState) {
      const product = category.products.find((item) => item.id === productId);
      if (product) {
        return product;
      }
    }

    return undefined;
  }

  private mockResponse<T>(value: T): Observable<T> {
    return of(this.clone(value)).pipe(delay(this.fallbackLatencyMs));
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}
