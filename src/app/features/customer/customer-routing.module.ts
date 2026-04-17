import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';
import { ProfileComponent } from './pages/profile/profile.component';

const routes: Routes = [
  { path: 'home',           component: HomeComponent },
  { path: 'products',       component: ProductListComponent },
  { path: 'products/:id',   component: ProductDetailsComponent },
  { path: 'cart',            component: CartComponent },
  { path: 'checkout',       component: CheckoutComponent },
  { path: 'orders',         component: OrderHistoryComponent },
  { path: 'profile',        component: ProfileComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
