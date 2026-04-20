import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      { path: 'overview', component: SellerOverviewComponent },
      { path: 'products', component: MyProductsComponent },
      { path: 'products/new', component: AddProductComponent, data: { mode: 'create' } },
      { path: 'products/:id/edit', component: AddProductComponent, data: { mode: 'edit' } },
      { path: 'products/:id/details', component: ProductDetailsComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'profile', component: ProfileComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SellerRoutingModule {}
