import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

function buildAdminAccessDecision(targetUrl: string): boolean | UrlTree {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: targetUrl }
    });
  }

  if (authService.hasRole('Admin')) {
    return true;
  }

  return router.parseUrl(authService.getDashboardRouteByRole());
}

export const adminGuard: CanActivateFn = (_route, state) => {
  return buildAdminAccessDecision(state.url);
};

export const adminMatchGuard: CanMatchFn = (_route, segments) => {
  const attemptedUrl = `/${segments.map((segment) => segment.path).join('/')}`;
  return buildAdminAccessDecision(attemptedUrl === '/' ? '/admin' : attemptedUrl);
};
