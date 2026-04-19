import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';
import { authGuard } from '../../core/guards/auth.guard';
import { AdminShellComponent } from './components/admin-shell/admin-shell.component';
import { ManageUsersComponent } from './pages/manage-users/manage-users.component';
import { ManageProductsComponent } from './pages/manage-products/manage-products.component';
import { ManageCategoriesComponent } from './pages/manage-categories/manage-categories.component';
import { ManageSellersComponent } from './pages/manage-sellers/manage-sellers.component';
import { DashboardComponent } from '../seller/pages/dashboard/dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    canActivate: [authGuard, adminGuard],
    canActivateChild: [authGuard, adminGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: ManageUsersComponent },
      { path: 'sellers', component: ManageSellersComponent },
      { path: 'categories', component: ManageCategoriesComponent },
      { path: 'products', component: ManageProductsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
