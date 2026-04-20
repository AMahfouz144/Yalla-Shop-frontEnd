import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { SellerRoutingModule } from './seller-routing.module';
import { SellerSettingsService } from './services/seller-settings.service';
import { SellerShellComponent } from './components/seller-shell/seller-shell.component';
import { SellerOverviewComponent } from './pages/seller-overview/seller-overview.component';
import { MyProductsComponent } from './pages/my-products/my-products.component';
import { AddProductComponent } from './pages/add-product/add-product.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { ProfileComponent } from './pages/profile/profile.component';

@NgModule({
  declarations: [
    SellerShellComponent,
    SellerOverviewComponent,
    MyProductsComponent,
    AddProductComponent,
    ProductDetailsComponent,
    OrdersComponent,
    ProfileComponent
  ],
  imports: [SharedModule, SellerRoutingModule],
  providers: [SellerSettingsService]
})
export class SellerModule {}
