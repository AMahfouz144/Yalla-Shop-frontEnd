import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ManageUsersComponent } from './pages/manage-users/manage-users.component';
import { ManageProductsComponent } from './pages/manage-products/manage-products.component';
import { ManageCategoriesComponent } from './pages/manage-categories/manage-categories.component';
import { ManageOrdersComponent } from './pages/manage-orders/manage-orders.component';

const routes: Routes = [
  { path: 'dashboard',   component: DashboardComponent },
  { path: 'users',       component: ManageUsersComponent },
  { path: 'products',    component: ManageProductsComponent },
  { path: 'categories',  component: ManageCategoriesComponent },
  { path: 'orders',      component: ManageOrdersComponent },

  // Default redirect within /admin
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
