import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { StarRatingComponent } from './components/star-rating/star-rating.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { TruncatePipe } from './pipes/truncate.pipe';
import { CurrencyEgpPipe } from './pipes/currency-egp.pipe';
import { UsdPricePipe } from './pipes/usd-price.pipe';
import { HighlightDirective } from './directives/highlight.directive';

@NgModule({
  declarations: [
    NavbarComponent,
    FooterComponent,
    ProductCardComponent,
    StarRatingComponent,
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
    TruncatePipe,
    CurrencyEgpPipe,
    UsdPricePipe,
    HighlightDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    // Re-export common modules so feature modules don't need to import them
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    // Export all shared components, pipes, directives
    NavbarComponent,
    FooterComponent,
    ProductCardComponent,
    StarRatingComponent,
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
    TruncatePipe,
    CurrencyEgpPipe,
    UsdPricePipe,
    HighlightDirective
  ]
})
export class SharedModule { }
