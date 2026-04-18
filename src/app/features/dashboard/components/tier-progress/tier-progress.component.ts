import { Component, Input } from '@angular/core';

import { LoyaltySummary } from '../../models/dashboard.models';

@Component({
  selector: 'app-tier-progress',
  templateUrl: './tier-progress.component.html',
  styleUrl: './tier-progress.component.css'
})
export class TierProgressComponent {
  @Input({ required: true }) loyalty!: LoyaltySummary;

  get progressValue(): number {
    return Math.min(Math.max(this.loyalty.progress, 0), 100);
  }
}
