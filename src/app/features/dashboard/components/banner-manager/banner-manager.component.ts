import { Component, EventEmitter, Input, Output } from '@angular/core';

import { BannerItem, TableCellStatus } from '../../models/dashboard.models';

@Component({
  selector: 'app-banner-manager',
  templateUrl: './banner-manager.component.html',
  styleUrl: './banner-manager.component.css'
})
export class BannerManagerComponent {
  @Input({ required: true }) banners: BannerItem[] = [];

  @Output() readonly upload = new EventEmitter<string[]>();
  @Output() readonly deleteBanner = new EventEmitter<string>();

  onFileSelection(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fileNames = Array.from(input.files ?? []).map(file => file.name);

    if (fileNames.length) {
      this.upload.emit(fileNames);
    }

    input.value = '';
  }

  statusClasses(status: TableCellStatus): string {
    switch (status.tone) {
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
