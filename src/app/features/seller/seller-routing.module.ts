import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleChildGuard, roleGuard } from '../../core/guards/role.guard';
import { SellerShellComponent } from './components/seller-shell/seller-shell.component';
import { SellerOverviewComponent } from './pages/seller-overview/seller-overview.component';
import { MyProductsComponent } from './pages/my-products/my-products.component';
import { AddProductComponent } from './pages/add-product/add-product.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { ProfileComponent } from './pages/profile/profile.component';

const routes: Routes = [
  {
    path: '',
    component: SellerShellComponent,
    canActivate: [authGuard, roleGuard],
    canActivateChild: [authGuard, roleChildGuard],
    data: { roles: ['Seller'] },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      { path: 'overview', component: SellerOverviewComponent, data: { roles: ['Seller'] } },
      { path: 'products', component: MyProductsComponent, data: { roles: ['Seller'] } },
      { path: 'products/new', component: AddProductComponent, data: { mode: 'create', roles: ['Seller'] } },
      { path: 'products/:id/edit', component: AddProductComponent, data: { mode: 'edit', roles: ['Seller'] } },
      { path: 'products/:id/details', component: ProductDetailsComponent, data: { roles: ['Seller'] } },
      { path: 'orders', component: OrdersComponent, data: { roles: ['Seller'] } },
      { path: 'profile', component: ProfileComponent, data: { roles: ['Seller'] } }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SellerRoutingModule {}
