import { Component, EventEmitter, Input, Output } from '@angular/core';

import {
  DashboardMode,
  DashboardModeOption,
  DashboardNotification,
  DashboardUserProfile
} from '../../models/dashboard.models';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  @Input({ required: true }) currentMode: DashboardMode = 'admin';
  @Input({ required: true }) modes: DashboardModeOption[] = [];
  @Input() notificationCount = 0;
  @Input() notifications: DashboardNotification[] = [];
  @Input({ required: true }) user!: DashboardUserProfile;
  @Input() searchPlaceholder = 'Search...';

  @Output() readonly toggleSidebar = new EventEmitter<void>();
  @Output() readonly modeChange = new EventEmitter<DashboardMode>();

  notificationsOpen = false;
  profileOpen = false;

  toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
    this.profileOpen = false;
  }

  toggleProfile(): void {
    this.profileOpen = !this.profileOpen;
    this.notificationsOpen = false;
  }
}
