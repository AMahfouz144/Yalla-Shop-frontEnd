import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardOverviewComponent } from './pages/dashboard-overview/dashboard-overview.component';
import { DashboardShellComponent } from './pages/dashboard-shell/dashboard-shell.component';
import { DashboardWorkspaceComponent } from './pages/dashboard-workspace/dashboard-workspace.component';

const routes: Routes = [
  { path: '', redirectTo: 'admin/overview', pathMatch: 'full' },
  {
    path: ':mode',
    component: DashboardShellComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: DashboardOverviewComponent },
      { path: 'products/categories', component: DashboardWorkspaceComponent, data: { pageKey: 'categories' } },
      { path: 'products/inventory', component: DashboardWorkspaceComponent, data: { pageKey: 'inventory' } },
      {
        path: 'products/pending-approvals',
        component: DashboardWorkspaceComponent,
        data: { pageKey: 'pending-approvals' }
      },
      { path: 'orders/shipping', component: DashboardWorkspaceComponent, data: { pageKey: 'shipping' } },
      { path: 'content/banners', component: DashboardWorkspaceComponent, data: { pageKey: 'banners' } },
      { path: 'content/pages', component: DashboardWorkspaceComponent, data: { pageKey: 'pages' } },
      { path: 'marketing', component: DashboardWorkspaceComponent, data: { pageKey: 'marketing' } }
    ]
  },
  { path: '**', redirectTo: 'admin/overview' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }

