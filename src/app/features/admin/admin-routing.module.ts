import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleChildGuard, roleGuard } from '../../core/guards/role.guard';
import { AdminShellComponent } from './components/admin-shell/admin-shell.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ManageCustomersComponent } from './pages/manage-customers/manage-customers.component';
import { ManageProductsComponent } from './pages/manage-products/manage-products.component';
import { ManageSellersComponent } from './pages/manage-sellers/manage-sellers.component';
import { PendingProductsComponent } from './pages/pending-products/pending-products.component';

const routes: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    canActivate: [authGuard, roleGuard],
    canActivateChild: [authGuard, roleChildGuard],
    data: { roles: ['Admin'] },
    children: [
      { path: 'dashboard', component: DashboardComponent, data: { roles: ['Admin'] } },
      { path: 'customers', component: ManageCustomersComponent, data: { roles: ['Admin'] } },
      { path: 'sellers', component: ManageSellersComponent, data: { roles: ['Admin'] } },
      { path: 'products', component: ManageProductsComponent, data: { roles: ['Admin'] } },
      { path: 'pending-products', component: PendingProductsComponent, data: { roles: ['Admin'] } },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
