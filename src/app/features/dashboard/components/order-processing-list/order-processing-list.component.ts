import { Component, EventEmitter, Input, Output } from '@angular/core';

import { SellerOrderItem, StatusTone } from '../../models/dashboard.models';

@Component({
  selector: 'app-order-processing-list',
  templateUrl: './order-processing-list.component.html',
  styleUrl: './order-processing-list.component.css'
})
export class OrderProcessingListComponent {
  @Input({ required: true }) orders: SellerOrderItem[] = [];

  @Output() readonly viewOrder = new EventEmitter<string>();

  badgeClasses(tone: StatusTone): string {
    switch (tone) {
      case 'success':
        return 'bg-emerald-50 text-emerald-700';
      case 'warning':
        return 'bg-amber-50 text-amber-700';
      case 'danger':
        return 'bg-rose-50 text-rose-700';
      default:
        return 'bg-blue-50 text-blue-700';
    }
  }
}
