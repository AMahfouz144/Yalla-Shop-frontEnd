import { Component, EventEmitter, Input, Output } from '@angular/core';

import { EngagementSetting } from '../../models/dashboard.models';

@Component({
  selector: 'app-engagement-settings',
  templateUrl: './engagement-settings.component.html',
  styleUrl: './engagement-settings.component.css'
})
export class EngagementSettingsComponent {
  @Input({ required: true }) settings: EngagementSetting[] = [];

  @Output() readonly settingChange = new EventEmitter<{ id: string; enabled: boolean }>();
}

