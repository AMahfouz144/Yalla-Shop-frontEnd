import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Subject, takeUntil } from 'rxjs';

import {
  BannerItem,
  DashboardMode,
  DashboardTableActionEvent,
  DashboardTableRow,
  EngagementSetting,
  LoyaltySummary,
  WorkspacePageData,
  WorkspacePageKey
} from '../../models/dashboard.models';
import { coerceDashboardMode, getWorkspaceMock } from '../../mock/dashboard.mock-data';

@Component({
  selector: 'app-dashboard-workspace',
  templateUrl: './dashboard-workspace.component.html',
  styleUrl: './dashboard-workspace.component.css'
})
export class DashboardWorkspaceComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  currentMode: DashboardMode = 'admin';
  pageData: WorkspacePageData | null = null;
  feedbackMessage = '';

  constructor(private readonly route: ActivatedRoute) { }

  ngOnInit(): void {
    combineLatest([
      this.route.parent?.paramMap ?? this.route.paramMap,
      this.route.data
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([params, data]) => {
        const pageKey = this.coercePageKey(data['pageKey']);
        const mode = coerceDashboardMode(params.get('mode'));

        this.currentMode = mode;
        this.pageData = getWorkspaceMock(mode, pageKey).data;
        this.feedbackMessage = '';
      });
  }

  onPrimaryAction(): void {
    if (!this.pageData?.table) {
      return;
    }

    if (this.pageData.pageKey === 'inventory') {
      this.pageData.table.rows = [this.createInventoryRow(this.pageData.table.rows.length + 1), ...this.pageData.table.rows];
      this.feedbackMessage = 'A new mock inventory row was added.';
      return;
    }

    if (this.pageData.pageKey === 'pages') {
      const newPage: DashboardTableRow = {
        id: `page_new_${Date.now()}`,
        title: 'New Draft Page',
        owner: 'Dashboard User',
        updated: 'Just now',
        status: { label: 'Draft', tone: 'warning' },
        actions: [
          { id: 'edit', label: 'Edit', icon: 'edit', tone: 'info' },
          { id: 'delete', label: 'Delete', icon: 'delete', tone: 'danger' }
        ]
      };
      this.pageData.table.rows = [newPage, ...this.pageData.table.rows];
      this.feedbackMessage = 'A new mock page was added to the content table.';
    }
  }

  onRowAction(event: DashboardTableActionEvent): void {
    if (!this.pageData?.table) {
      return;
    }

    if (event.actionId === 'delete' || event.actionId === 'reject') {
      this.pageData.table.rows = this.pageData.table.rows.filter(row => row.id !== event.rowId);
      this.feedbackMessage = `${event.actionId === 'delete' ? 'Item deleted' : 'Approval rejected'} from local mock state.`;
      return;
    }

    if (event.actionId === 'approve') {
      this.pageData.table.rows = this.pageData.table.rows.filter(row => row.id !== event.rowId);
      this.feedbackMessage = 'Approval action emitted and item removed from the queue.';
      return;
    }

    this.feedbackMessage = `${event.actionId} action emitted for ${event.rowId}.`;
  }

  onBannerUpload(fileNames: string[]): void {
    if (!this.pageData?.banners) {
      return;
    }

    const uploaded: BannerItem[] = fileNames.map((name, index) => ({
      id: `workspace_banner_${Date.now()}_${index}`,
      title: name.replace(/\.[^.]+$/, ''),
      placement: 'Workspace Upload',
      summary: 'Locally uploaded banner tied to static mock state.',
      status: { label: 'Draft', tone: 'warning' },
      accent: 'linear-gradient(135deg, #1d4ed8 0%, #60a5fa 55%, #dbeafe 100%)',
      ctaLabel: 'Preview banner'
    }));

    this.pageData.banners = [...uploaded, ...this.pageData.banners];
    this.feedbackMessage = `${fileNames.length} new banner mock item${fileNames.length > 1 ? 's' : ''} created.`;
  }

  onBannerDelete(id: string): void {
    if (!this.pageData?.banners) {
      return;
    }

    this.pageData.banners = this.pageData.banners.filter(banner => banner.id !== id);
    this.feedbackMessage = 'Banner removed from the workspace mock data.';
  }

  onRedeem(): void {
    if (!this.pageData?.loyalty) {
      return;
    }

    const nextBalance = Math.max(this.pageData.loyalty.pointsBalance - 250, 0);
    this.pageData.loyalty = this.recalculateLoyalty(this.pageData.loyalty, nextBalance);
    this.feedbackMessage = '250 points were redeemed from the workspace loyalty state.';
  }

  onSettingChange(event: { id: string; enabled: boolean }): void {
    if (!this.pageData?.settings) {
      return;
    }

    this.pageData.settings = this.pageData.settings.map((setting: EngagementSetting) =>
      setting.id === event.id ? { ...setting, enabled: event.enabled } : setting
    );
    this.feedbackMessage = `Setting updated: ${event.id}.`;
  }

  onShare(channelId: string): void {
    this.feedbackMessage = `Referral action emitted for ${channelId.toUpperCase()}.`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createInventoryRow(index: number): DashboardTableRow {
    return {
      id: `wrk_prd_${index}`,
      product: {
        imageUrl:
          'data:image/svg+xml;utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2296%22 height=%2296%22 viewBox=%220 0 96 96%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22%3E%3Cstop offset=%220%25%22 stop-color=%22%230f172a%22 /%3E%3Cstop offset=%22100%25%22 stop-color=%22%233b82f6%22 /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%2296%22 height=%2296%22 rx=%2226%22 fill=%22url(%23g)%22 /%3E%3Ctext x=%2250%25%22 y=%2254%25%22 text-anchor=%22middle%22 fill=%22%23f8fafc%22 font-family=%22Inter, Arial, sans-serif%22 font-size=%2230%22 font-weight=%22700%22%3EWI%3C/text%3E%3C/svg%3E',
        title: `Workspace Item ${index}`,
        subtitle: `SKU WI-${200 + index}`
      },
      currentStock: { value: 7, label: 'Low Stock', tone: 'warning' },
      price: 129,
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

  private coercePageKey(value: unknown): WorkspacePageKey {
    const pageKeys: WorkspacePageKey[] = [
      'categories',
      'inventory',
      'pending-approvals',
      'shipping',
      'banners',
      'pages',
      'marketing'
    ];

    if (typeof value === 'string' && pageKeys.includes(value as WorkspacePageKey)) {
      return value as WorkspacePageKey;
    }

    return 'categories';
  }
}
