import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MyProductsComponent } from './pages/my-products/my-products.component';
import { AddProductComponent } from './pages/add-product/add-product.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { ProfileComponent } from './pages/profile/profile.component';

const routes: Routes = [
  { path: 'dashboard',  component: DashboardComponent },
  { path: 'products',   component: MyProductsComponent },
  { path: 'add-product', component: AddProductComponent },
  { path: 'orders',     component: OrdersComponent },
  { path: 'profile',    component: ProfileComponent },

  // Default redirect within /seller
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SellerRoutingModule { }
