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

  // Unified dashboard feature module
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
  },

  // Legacy role entry points route into the unified dashboard module
  {
    path: 'admin',
    redirectTo: 'dashboard/admin/overview',
    pathMatch: 'full'
  },
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
