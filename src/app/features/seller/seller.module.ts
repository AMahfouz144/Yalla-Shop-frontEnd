import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { SellerRoutingModule } from './seller-routing.module';
import { MyProductsComponent } from './pages/my-products/my-products.component';
import { AddProductComponent } from './pages/add-product/add-product.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { ProfileComponent } from './pages/profile/profile.component';

@NgModule({
  declarations: [
    MyProductsComponent,
    AddProductComponent,
    OrdersComponent,
    ProfileComponent
  ],
  imports: [
    SharedModule,
    SellerRoutingModule
  ]
})
export class SellerModule { }
