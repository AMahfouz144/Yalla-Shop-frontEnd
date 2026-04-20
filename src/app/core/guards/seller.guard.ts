import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

function buildSellerAccessDecision(targetUrl: string): boolean | UrlTree {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: targetUrl }
    });
  }

  if (authService.hasRole('Seller')) {
    return true;
  }

  return router.parseUrl(authService.getDashboardRouteByRole());
}

export const sellerMatchGuard: CanMatchFn = (_route, segments) => {
  const attemptedUrl = `/${segments.map(s => s.path).join('/')}`;
  return buildSellerAccessDecision(attemptedUrl === '/' ? '/seller' : attemptedUrl);
};
