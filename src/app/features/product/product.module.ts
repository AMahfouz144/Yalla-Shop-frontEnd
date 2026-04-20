import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ProductReviewsComponent } from './components/product-reviews/product-reviews.component';
import { ProductCatalogComponent } from './pages/product-catalog/product-catalog.component';
import { ProductDetailPageComponent } from './pages/product-detail-page/product-detail-page.component';
import { ProductRoutingModule } from './product-routing.module';

@NgModule({
  declarations: [ProductCatalogComponent, ProductDetailPageComponent, ProductReviewsComponent],
  imports: [SharedModule, ProductRoutingModule]
})
export class ProductModule {}
