import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CartRoutingModule } from './cart-routing.module';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { OrderConfirmationComponent } from './components/order-confirmation/order-confirmation.component';

@NgModule({
  declarations: [CheckoutComponent, OrderConfirmationComponent],
  imports: [SharedModule, CartRoutingModule],
})
export class CartModule {}
