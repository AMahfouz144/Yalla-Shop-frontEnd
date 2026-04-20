import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { OrderService } from '../../../../core/services/order.service';
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
  readonly OrderStatus = OrderStatus;

  // Track updating state per order
  isUpdating: Record<number, boolean> = {};

  // For toast message
  toastMsg: string | null = null;
  toastType: 'success' | 'error' = 'success';

  constructor(
    private readonly authService: AuthService,
    private readonly orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const user = this.authService.getSessionUser();
    if (!user) {
      this.errorMsg = 'You must be logged in to view orders.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMsg = null;
    this.orderService.getOrdersBySeller(user.userId).subscribe({
      next: res => {
        this.orders = res.data ?? [];
        this.isLoading = false;
      },
      error: err => {
        this.errorMsg = err.message || 'Could not load orders.';
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

  updateStatus(order: OrderResponseDto, newStatusStr: string): void {
    const newStatus = Number(newStatusStr) as OrderStatus;
    if (newStatusStr===''|| isNaN(newStatus)) return;

    if (!confirm('Are you sure you want to update the status of this order?')) {
      this.loadOrders();
      return;
    }

    this.isUpdating[order.id] = true;
    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        this.showToast('Order status updated successfully', 'success');
        this.isUpdating[order.id] = false;
        this.loadOrders(); // Refresh order list after update
      },
      error: err => {
        this.showToast(err.message || 'Failed to update order status', 'error');
        this.isUpdating[order.id] = false;
        this.loadOrders();
      }
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMsg = message;
    this.toastType = type;
    setTimeout(() => {
      this.toastMsg = null;
    }, 3000);
  }
}
