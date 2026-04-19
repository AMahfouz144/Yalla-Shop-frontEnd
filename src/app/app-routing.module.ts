import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { adminMatchGuard } from './core/guards/admin.guard';

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

  // Unified dashboard feature module
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
  },

  // Admin area
  {
    path: 'admin',
    canMatch: [adminMatchGuard],
    loadChildren: () =>
      import('./features/admin/admin.module').then(m => m.AdminModule)
  },

  // Legacy role entry points route into the unified dashboard module
  {
    path: 'seller',
    redirectTo: 'dashboard/seller/overview',
    pathMatch: 'full'
  },
  {
    path: 'marketing',
    redirectTo: 'dashboard/marketing/overview',
    pathMatch: 'full'
  },

  {
    path: 'products',
    loadChildren: () =>
      import('./features/product/product.module').then(m => m.ProductModule)
  },

  // Customer-facing pages (home, products, cart, etc.)
  {
    path: '',
    loadChildren: () =>
      import('./features/customer/customer.module').then(m => m.CustomerModule)
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
