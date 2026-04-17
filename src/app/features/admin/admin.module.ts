import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ManageUsersComponent } from './pages/manage-users/manage-users.component';
import { ManageProductsComponent } from './pages/manage-products/manage-products.component';
import { ManageCategoriesComponent } from './pages/manage-categories/manage-categories.component';
import { ManageOrdersComponent } from './pages/manage-orders/manage-orders.component';

@NgModule({
  declarations: [
    DashboardComponent,
    ManageUsersComponent,
    ManageProductsComponent,
    ManageCategoriesComponent,
    ManageOrdersComponent
  ],
  imports: [
    SharedModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
