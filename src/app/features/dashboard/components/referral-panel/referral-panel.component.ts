import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ReferralPanelData } from '../../models/dashboard.models';

@Component({
  selector: 'app-referral-panel',
  templateUrl: './referral-panel.component.html',
  styleUrl: './referral-panel.component.css'
})
export class ReferralPanelComponent {
  @Input({ required: true }) referral!: ReferralPanelData;

  @Output() readonly share = new EventEmitter<string>();
}

