import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminShellComponent } from './components/admin-shell/admin-shell.component';
import { ManageUsersComponent } from './pages/manage-users/manage-users.component';
import { ManageProductsComponent } from './pages/manage-products/manage-products.component';
import { ManageCategoriesComponent } from './pages/manage-categories/manage-categories.component';
import { ManageSellersComponent } from './pages/manage-sellers/manage-sellers.component';
// import { DashboardComponent } from '../seller/pages/dashboard/dashboard.component';

@NgModule({
  declarations: [
    AdminShellComponent,
    // DashboardComponent,
    ManageUsersComponent,
    ManageProductsComponent,
    ManageCategoriesComponent,
    ManageSellersComponent
  ],
  imports: [
    SharedModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
