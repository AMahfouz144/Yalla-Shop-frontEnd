import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../../core/services/order.service';
import { AuthService } from '../../../../core/services/auth.service';
import { OrderResponseDto, ORDER_STATUS_LABELS, OrderStatus } from '../../../../core/models/order-history.model';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent implements OnInit {

  orders: OrderResponseDto[] = [];
  isLoading = true;
  errorMsg: string | null = null;
  readonly OrderStatus = OrderStatus;
  readonly statusLabels = ORDER_STATUS_LABELS;

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getSessionUser();
    if (!user) {
      this.errorMsg = 'You must be logged in to view your orders.';
      this.isLoading = false;
      return;
    }

    this.orderService.getOrdersByCustomer(user.userId).subscribe({
      next: (res) => {
        this.orders = res.data ?? [];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = err.message;
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      [OrderStatus.Pending]:    'badge-pending',
      [OrderStatus.Processing]: 'badge-processing',
      [OrderStatus.Shipped]:    'badge-shipped',
      [OrderStatus.Delivered]:  'badge-delivered',
      [OrderStatus.Cancelled]:  'badge-cancelled',
    };
    return map[status] ?? '';
  }
}

