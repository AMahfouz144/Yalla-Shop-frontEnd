import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { CustomerRoutingModule } from './customer-routing.module';
import { CartModule } from '../cart/cart.module';
import { HomeComponent } from './pages/home/home.component';
import { CartComponent } from './pages/cart/cart.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { HeroBannerComponent } from './components/hero-banner/hero-banner.component';
import { CategoriesGridComponent } from './components/categories-grid/categories-grid.component';
import { NewArrivalsComponent } from './components/new-arrivals/new-arrivals.component';
import { NewsletterComponent } from './components/newsletter/newsletter.component';
import { ChangePasswordComponent } from '../Profile/Pages/ChangePassword/change-password/change-password.component';
import { UpdateEmailComponent } from '../Profile/Pages/UpdateEmail/update-email/update-email.component';

@NgModule({
  declarations: [
    HomeComponent,
    CartComponent,
    OrderHistoryComponent,
    ProfileComponent,
    UpdateEmailComponent,
    ChangePasswordComponent,
    HeroBannerComponent,
    CategoriesGridComponent,
    NewArrivalsComponent,
    NewsletterComponent
  ],
  imports: [
    SharedModule,
    CustomerRoutingModule,
    CartModule,
  ]
})
export class CustomerModule { }
