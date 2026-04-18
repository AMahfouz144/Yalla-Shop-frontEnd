import { Component, EventEmitter, Input, Output } from '@angular/core';

import { DashboardBrand, DashboardMode, DashboardNavLink } from '../../models/dashboard.models';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input({ required: true }) brand!: DashboardBrand;
  @Input({ required: true }) navigation: DashboardNavLink[] = [];
  @Input({ required: true }) currentMode: DashboardMode = 'admin';
  @Input({ required: true }) currentUrl = '';
  @Input() isOpen = false;

  @Output() readonly closeSidebar = new EventEmitter<void>();

  buildLink(path?: string[]): string[] {
    return ['/dashboard', this.currentMode, ...(path ?? ['overview'])];
  }

  isLinkActive(path?: string[]): boolean {
    if (!path) {
      return false;
    }

    const targetUrl = `/dashboard/${this.currentMode}/${path.join('/')}`;
    return this.currentUrl === targetUrl || this.currentUrl.startsWith(`${targetUrl}/`);
  }

  isGroupActive(link: DashboardNavLink): boolean {
    if (link.path && this.isLinkActive(link.path)) {
      return true;
    }

    return Boolean(link.children?.some(child => this.isLinkActive(child.path)));
  }
}
