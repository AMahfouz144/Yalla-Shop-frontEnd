import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
<<<<<<< HEAD
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
=======
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
>>>>>>> 30a3d03e32e394d105ef6c014cd24da0b4c023b0
import { OrderHistoryComponent } from './pages/order-history/order-history.component';
import { ProfileComponent } from './pages/profile/profile.component';

const routes: Routes = [
  { path: 'home',           component: HomeComponent },
<<<<<<< HEAD
  { path: 'cart',            component: CartComponent },
  { path: 'checkout',       component: CheckoutComponent },
=======
  { path: 'products',       component: ProductListComponent },
  { path: 'products/:id',   component: ProductDetailsComponent },
  { path: 'cart',           redirectTo: 'checkout', pathMatch: 'full' },
  { path: 'orders/:orderId', component: OrderHistoryComponent },
>>>>>>> 30a3d03e32e394d105ef6c014cd24da0b4c023b0
  { path: 'orders',         component: OrderHistoryComponent },
  { path: 'profile',        component: ProfileComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
