import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { API_BASE_URL } from '../../../../core/config/api-base';
import { ResponseModel } from '../../../../core/Interfaces/response-model';
import { OrderResponseDto, ORDER_STATUS_LABELS, OrderStatus } from '../../../../core/models/order-history.model';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  orders: OrderResponseDto[] = [];
  isLoading = true;
  errorMsg: string | null = null;
  readonly statusLabels = ORDER_STATUS_LABELS;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getSessionUser();
    if (!user) {
      this.errorMsg = 'You must be logged in to view orders.';
      this.isLoading = false;
      return;
    }

    const url = `${API_BASE_URL}/Orders/seller/${encodeURIComponent(user.userId)}`;
    this.http.get<ResponseModel<OrderResponseDto[]>>(url).subscribe({
      next: res => {
        this.orders = res.data ?? [];
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.errorMsg =
          typeof err.error === 'object' && err.error && 'message' in err.error
            ? String((err.error as { message?: string }).message)
            : err.message || 'Could not load orders.';
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      [OrderStatus.Pending]: 'bg-amber-100 text-amber-900',
      [OrderStatus.Processing]: 'bg-sky-100 text-sky-900',
      [OrderStatus.Shipped]: 'bg-violet-100 text-violet-900',
      [OrderStatus.Delivered]: 'bg-emerald-100 text-emerald-900',
      [OrderStatus.Cancelled]: 'bg-rose-100 text-rose-900'
    };
    return map[status] ?? 'bg-slate-100 text-slate-800';
  }
}
