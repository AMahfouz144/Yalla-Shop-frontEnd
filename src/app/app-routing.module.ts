import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // Default redirect
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

  // Auth (login, register, forgot-password)
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule)
  },

  // Customer-facing pages (home, products, cart, etc.)
  {
    path: '',
    loadChildren: () =>
      import('./features/customer/customer.module').then(m => m.CustomerModule)
  },

  // Seller dashboard
  {
    path: 'seller',
    loadChildren: () =>
      import('./features/seller/seller.module').then(m => m.SellerModule)
  },

  // Admin panel
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.module').then(m => m.AdminModule)
  },

  // Wildcard — redirect to home
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
