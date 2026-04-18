import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import {
  DashboardTableActionEvent,
  DashboardTableCellValue,
  DashboardTableColumn,
  DashboardTableData,
  DashboardTableRow,
  TableAction,
  TableCellProduct,
  TableCellStatus,
  TableCellStock
} from '../../models/dashboard.models';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css'
})
export class DataTableComponent implements OnChanges {
  @Input({ required: true }) data!: DashboardTableData;

  @Output() readonly sortChange = new EventEmitter<{ key: string; direction: 'asc' | 'desc' }>();
  @Output() readonly pageChange = new EventEmitter<number>();
  @Output() readonly rowAction = new EventEmitter<DashboardTableActionEvent>();
  @Output() readonly primaryAction = new EventEmitter<void>();

  currentPage = 1;
  activeSortKey = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      const firstSortable = this.data.columns.find(column => column.sortable);
      this.activeSortKey = this.activeSortKey || firstSortable?.key || '';
      this.currentPage = 1;
    }
  }

  onSort(column: DashboardTableColumn): void {
    if (!column.sortable) {
      return;
    }

    if (this.activeSortKey === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.activeSortKey = column.key;
      this.sortDirection = 'asc';
    }

    this.sortChange.emit({ key: this.activeSortKey, direction: this.sortDirection });
  }

  onSelectPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.pageChange.emit(page);
  }

  emitRowAction(action: TableAction, row: DashboardTableRow): void {
    this.rowAction.emit({ actionId: action.id, rowId: row.id, row });
  }

  isSorted(column: DashboardTableColumn): boolean {
    return this.activeSortKey === column.key;
  }

  sortIcon(column: DashboardTableColumn): string {
    if (!this.isSorted(column)) {
      return 'swap_vert';
    }

    return this.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  alignmentClass(column: DashboardTableColumn): string {
    if (column.align === 'right') {
      return 'text-right';
    }

    if (column.align === 'center') {
      return 'text-center';
    }

    return 'text-left';
  }

  statusClasses(status: TableCellStatus): string {
    switch (status.tone) {
      case 'success':
        return 'bg-emerald-50 text-emerald-700';
      case 'warning':
        return 'bg-amber-50 text-amber-700';
      case 'danger':
        return 'bg-rose-50 text-rose-700';
      case 'info':
        return 'bg-blue-50 text-blue-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  actionClasses(action: TableAction): string {
    switch (action.tone) {
      case 'danger':
        return 'text-rose-600 hover:bg-rose-50';
      case 'success':
        return 'text-emerald-600 hover:bg-emerald-50';
      case 'warning':
        return 'text-amber-600 hover:bg-amber-50';
      default:
        return 'text-slate-600 hover:bg-slate-100';
    }
  }

  asProduct(value: DashboardTableCellValue): TableCellProduct {
    return value as TableCellProduct;
  }

  asStatus(value: DashboardTableCellValue): TableCellStatus {
    return value as TableCellStatus;
  }

  asStock(value: DashboardTableCellValue): TableCellStock {
    return value as TableCellStock;
  }

  asActions(value: DashboardTableCellValue): TableAction[] {
    return Array.isArray(value) ? (value as TableAction[]) : [];
  }

  asNumber(value: DashboardTableCellValue): number {
    return typeof value === 'number' ? value : Number(value) || 0;
  }

  get visibleRows(): DashboardTableRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedRows.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(Math.ceil(this.sortedRows.length / this.pageSize), 1);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  private get pageSize(): number {
    return this.data.pageSize ?? 4;
  }

  private get sortedRows(): DashboardTableRow[] {
    const rows = [...this.data.rows];
    if (!this.activeSortKey) {
      return rows;
    }

    return rows.sort((left, right) => {
      const leftValue = this.getComparableValue(left[this.activeSortKey]);
      const rightValue = this.getComparableValue(right[this.activeSortKey]);

      if (leftValue < rightValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }

      if (leftValue > rightValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }

      return 0;
    });
  }

  private getComparableValue(value: DashboardTableCellValue): string | number {
    if (typeof value === 'number' || typeof value === 'string') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.length;
    }

    if (value && typeof value === 'object') {
      if ('value' in value && typeof value.value === 'number') {
        return value.value;
      }

      if ('title' in value) {
        return value.title ?? '';
      }

      if ('label' in value) {
        return value.label ?? '';
      }
    }

    return '';
  }
}
