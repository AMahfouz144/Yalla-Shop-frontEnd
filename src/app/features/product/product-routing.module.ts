import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductCatalogComponent } from './pages/product-catalog/product-catalog.component';
import { ProductDetailPageComponent } from './pages/product-detail-page/product-detail-page.component';

const routes: Routes = [
  { path: '', component: ProductCatalogComponent },
  { path: ':id', component: ProductDetailPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule {}
