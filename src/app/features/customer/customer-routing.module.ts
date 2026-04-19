import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CartComponent } from './pages/cart/cart.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { DashboardComponent } from '../admin/pages/dashboard/dashboard.component';

const routes: Routes = [
  { path: 'home', component: DashboardComponent },
  { path: 'cart', component: CartComponent },
  { path: 'orders', component: OrderHistoryComponent },
  { path: 'profile', component: ProfileComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule {}
