import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';
import { authGuard } from '../../core/guards/auth.guard';
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
    canActivate: [authGuard, adminGuard],
    canActivateChild: [authGuard, adminGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'customers', component: ManageCustomersComponent },
      { path: 'sellers', component: ManageSellersComponent },
      { path: 'products', component: ManageProductsComponent },
      { path: 'pending-products', component: PendingProductsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
