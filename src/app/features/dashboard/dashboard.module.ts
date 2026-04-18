import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { BannerManagerComponent } from './components/banner-manager/banner-manager.component';
import { ChartCardComponent } from './components/chart-card/chart-card.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { EngagementSettingsComponent } from './components/engagement-settings/engagement-settings.component';
import { LoyaltySummaryComponent } from './components/loyalty-summary/loyalty-summary.component';
import { OrderProcessingListComponent } from './components/order-processing-list/order-processing-list.component';
import { ReferralPanelComponent } from './components/referral-panel/referral-panel.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { StatCardComponent } from './components/stat-card/stat-card.component';
import { TierProgressComponent } from './components/tier-progress/tier-progress.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardOverviewComponent } from './pages/dashboard-overview/dashboard-overview.component';
import { DashboardShellComponent } from './pages/dashboard-shell/dashboard-shell.component';
import { DashboardWorkspaceComponent } from './pages/dashboard-workspace/dashboard-workspace.component';

@NgModule({
  declarations: [
    BannerManagerComponent,
    ChartCardComponent,
    DataTableComponent,
    EngagementSettingsComponent,
    LoyaltySummaryComponent,
    OrderProcessingListComponent,
    ReferralPanelComponent,
    SidebarComponent,
    StatCardComponent,
    TierProgressComponent,
    TopbarComponent,
    DashboardOverviewComponent,
    DashboardShellComponent,
    DashboardWorkspaceComponent
  ],
  imports: [
    SharedModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }

