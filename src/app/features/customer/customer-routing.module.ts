import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleChildGuard, roleGuard } from '../../core/guards/role.guard';
import { HomeComponent } from './pages/home/home.component';
import { CartComponent } from './pages/cart/cart.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';
import { ProfileComponent } from './pages/profile/profile.component';

const routes: Routes = [
  {
    path: '',
    canActivateChild: [authGuard, roleChildGuard],
    data: { roles: ['User'] },
    children: [
      { path: 'home', component: HomeComponent, canActivate: [authGuard, roleGuard], data: { roles: ['User'] } },
      { path: 'cart', component: CartComponent, canActivate: [authGuard, roleGuard], data: { roles: ['User'] } },
      { path: 'orders', component: OrderHistoryComponent, canActivate: [authGuard, roleGuard], data: { roles: ['User'] } },
      { path: 'profile', component: ProfileComponent, canActivate: [authGuard, roleGuard], data: { roles: ['User'] } }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule {}
