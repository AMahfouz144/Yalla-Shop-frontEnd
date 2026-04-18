import { Component, Input } from '@angular/core';

import { StatCardData } from '../../models/dashboard.models';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.css'
})
export class StatCardComponent {
  @Input({ required: true }) card!: StatCardData;

  iconClasses(): string {
    switch (this.card.tone) {
      case 'success':
        return 'bg-emerald-50 text-emerald-600';
      case 'warning':
        return 'bg-amber-50 text-amber-600';
      case 'danger':
        return 'bg-rose-50 text-rose-600';
      case 'info':
        return 'bg-blue-50 text-blue-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  }

  trendClasses(): string {
    return this.card.trendDirection === 'up'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-amber-50 text-amber-700';
  }
}
