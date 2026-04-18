import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { CustomerRoutingModule } from './customer-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
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
    ProductListComponent,
    ProductDetailsComponent,
    CartComponent,
    CheckoutComponent,
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
    CustomerRoutingModule
  ]
})
export class CustomerModule { }
