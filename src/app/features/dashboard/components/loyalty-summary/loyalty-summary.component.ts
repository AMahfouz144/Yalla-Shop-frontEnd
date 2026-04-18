import { Component, EventEmitter, Input, Output } from '@angular/core';

import { LoyaltySummary } from '../../models/dashboard.models';

@Component({
  selector: 'app-loyalty-summary',
  templateUrl: './loyalty-summary.component.html',
  styleUrl: './loyalty-summary.component.css'
})
export class LoyaltySummaryComponent {
  @Input({ required: true }) loyalty!: LoyaltySummary;

  @Output() readonly redeem = new EventEmitter<void>();
}

