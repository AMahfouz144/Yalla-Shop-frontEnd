import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { OrderConfirmationComponent } from './components/order-confirmation/order-confirmation.component';
import { PaymentComponent } from './components/payment/payment.component';

const routes: Routes = [
  { path: 'checkout', component: CheckoutComponent },
  { path: 'payment/:orderId', component: PaymentComponent },
  { path: 'order-confirmation', component: OrderConfirmationComponent },
  { path: 'order-confirmation/:orderId', component: OrderConfirmationComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CartRoutingModule {}
