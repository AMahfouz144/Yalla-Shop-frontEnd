import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CartComponent } from './pages/cart/cart.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ChangePasswordComponent } from '../Profile/Pages/ChangePassword/change-password/change-password.component';
import { UpdateEmailComponent } from '../Profile/Pages/UpdateEmail/update-email/update-email.component';
import { WishlistComponent } from './pages/wishlist/wishlist.component';
import { roleGuard } from '../../core/guards/role.guard';

const routes: Routes = [
  { path: 'home',           component: HomeComponent },
  { path: 'cart',            component: CartComponent },
  { path: 'orders',         component: OrderHistoryComponent },
  { path: 'profile',        component: ProfileComponent },
  { path: 'update-email',   component: UpdateEmailComponent },
  { path: 'change-password', component: ChangePasswordComponent },
  { path: 'wishlist',       component: WishlistComponent, canActivate: [roleGuard], data: { role: 'Customer' } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule {}
