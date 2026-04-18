import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import {
  BannerItem,
  DashboardMode,
  DashboardTableActionEvent,
  DashboardTableRow,
  EngagementSetting,
  LoyaltySummary,
  MarketingOverviewData,
  SellerOverviewData,
  WorkspacePageKey
} from '../../models/dashboard.models';
import {
  coerceDashboardMode,
  getAdminOverviewMock,
  getMarketingOverviewMock,
  getSellerOverviewMock
} from '../../mock/dashboard.mock-data';

@Component({
  selector: 'app-dashboard-overview',
  templateUrl: './dashboard-overview.component.html',
  styleUrl: './dashboard-overview.component.css'
})
export class DashboardOverviewComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  currentMode: DashboardMode = 'admin';
  adminOverview = getAdminOverviewMock().data;
  sellerOverview: SellerOverviewData | null = null;
  marketingOverview: MarketingOverviewData | null = null;
  feedbackMessage = '';

  constructor(private readonly route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.parent?.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.loadModeData(coerceDashboardMode(params.get('mode')));
      });
  }

  onBannerUpload(fileNames: string[]): void {
    const accents = [
      'linear-gradient(135deg, #0f172a 0%, #2563eb 55%, #93c5fd 100%)',
      'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #dbeafe 100%)'
    ];

    const uploaded: BannerItem[] = fileNames.map((fileName, index) => ({
      id: `bnr_uploaded_${Date.now()}_${index}`,
      title: fileName.replace(/\.[^.]+$/, ''),
      placement: 'Uploaded Draft',
      summary: 'New banner added from static upload input and ready for future API binding.',
      status: { label: 'Draft', tone: 'warning' },
      accent: accents[index % accents.length],
      ctaLabel: 'Review asset'
    }));

    this.adminOverview.banners = [...uploaded, ...this.adminOverview.banners];
    this.feedbackMessage = `${fileNames.length} banner${fileNames.length > 1 ? 's were' : ' was'} staged from mock upload data.`;
  }

  onBannerDelete(id: string): void {
    this.adminOverview.banners = this.adminOverview.banners.filter(banner => banner.id !== id);
    this.feedbackMessage = 'Banner removed from the local mock state.';
  }

  onTableAction(event: DashboardTableActionEvent): void {
    if (this.currentMode === 'seller' && this.sellerOverview) {
      if (event.actionId === 'delete') {
        this.sellerOverview.inventory.rows = this.sellerOverview.inventory.rows.filter(row => row.id !== event.rowId);
        this.feedbackMessage = 'Product removed from the seller inventory mock table.';
        return;
      }

      if (event.actionId === 'edit') {
        this.feedbackMessage = `Edit action emitted for ${this.getRowTitle(event.row)}.`;
      }
    }
  }

  onAddProduct(): void {
    if (!this.sellerOverview) {
      return;
    }

    const newRow = this.createInventoryRow(this.sellerOverview.inventory.rows.length + 1);
    this.sellerOverview.inventory.rows = [newRow, ...this.sellerOverview.inventory.rows];
    this.feedbackMessage = 'A new mock product was added to the inventory table.';
  }

  onRedeemPoints(): void {
    if (!this.marketingOverview) {
      return;
    }

    const nextBalance = Math.max(this.marketingOverview.loyalty.pointsBalance - 500, 0);
    this.marketingOverview.loyalty = this.recalculateLoyalty(this.marketingOverview.loyalty, nextBalance);
    this.feedbackMessage = '500 points were redeemed from the local loyalty mock state.';
  }

  onSettingChange(event: { id: string; enabled: boolean }): void {
    if (!this.marketingOverview) {
      return;
    }

    this.marketingOverview.settings = this.marketingOverview.settings.map(setting =>
      setting.id === event.id ? { ...setting, enabled: event.enabled } : setting
    );
    this.feedbackMessage = `${event.id === 'notifications' ? 'Notifications' : 'Newsletter'} ${event.enabled ? 'enabled' : 'disabled'}.`;
  }

  onShare(channelId: string): void {
    this.feedbackMessage = `Share event emitted for ${channelId.toUpperCase()} using static referral data.`;
  }

  onViewOrder(orderId: string): void {
    this.feedbackMessage = `Order ${orderId} selected from the seller processing list.`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadModeData(mode: DashboardMode): void {
    this.currentMode = mode;
    this.feedbackMessage = '';

    if (mode === 'admin') {
      this.adminOverview = getAdminOverviewMock().data;
      this.sellerOverview = null;
      this.marketingOverview = null;
      return;
    }

    if (mode === 'seller') {
      this.sellerOverview = getSellerOverviewMock().data;
      this.marketingOverview = null;
      return;
    }

    this.sellerOverview = null;
    this.marketingOverview = getMarketingOverviewMock().data;
  }

  private createInventoryRow(index: number): DashboardTableRow {
    return {
      id: `prd_new_${index}`,
      product: {
        imageUrl:
          'data:image/svg+xml;utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2296%22 height=%2296%22 viewBox=%220 0 96 96%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22%3E%3Cstop offset=%220%25%22 stop-color=%22%231d4ed8%22 /%3E%3Cstop offset=%22100%25%22 stop-color=%22%2393c5fd%22 /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%2296%22 height=%2296%22 rx=%2226%22 fill=%22url(%23g)%22 /%3E%3Ctext x=%2250%25%22 y=%2254%25%22 text-anchor=%22middle%22 fill=%22%23f8fafc%22 font-family=%22Inter, Arial, sans-serif%22 font-size=%2230%22 font-weight=%22700%22%3ENP%3C/text%3E%3C/svg%3E',
        title: `New Product ${index}`,
        subtitle: `SKU NP-${100 + index}`
      },
      currentStock: { value: 12, label: 'In Stock', tone: 'success' },
      price: 145,
      actions: [
        { id: 'edit', label: 'Edit', icon: 'edit', tone: 'info' },
        { id: 'delete', label: 'Delete', icon: 'delete', tone: 'danger' }
      ]
    };
  }

  private recalculateLoyalty(loyalty: LoyaltySummary, pointsBalance: number): LoyaltySummary {
    const totalWindow = pointsBalance + loyalty.pointsToNextTier || 1;
    const remaining = Math.max(18000 - pointsBalance, 0);
    const progress = Math.min(Math.round((pointsBalance / totalWindow) * 100), 100);

    return {
      ...loyalty,
      pointsBalance,
      pointsLabel: `${pointsBalance.toLocaleString('en-US')} points`,
      pointsToNextTier: remaining,
      progress
    };
  }

  private getRowTitle(row: DashboardTableRow): string {
    const product = row['product'];
    if (product && typeof product === 'object' && 'title' in product) {
      return String(product.title);
    }

    return row.id;
  }
}
