import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChildFn,
  CanActivateFn,
  CanMatchFn,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree
} from '@angular/router';
import { AuthService } from '../services/auth.service';

function getAllowedRolesFromRoute(
  route: ActivatedRouteSnapshot | Route
): string[] {
  const roles = route.data?.['roles'];
  if (!Array.isArray(roles)) {
    return [];
  }

  return roles
    .map(role => (typeof role === 'string' ? role.trim().toLowerCase() : ''))
    .filter(Boolean);
}

function buildRoleAccessDecision(
  allowedRoles: string[],
  targetUrl: string
): boolean | UrlTree {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: targetUrl }
    });
  }

  const role = (authService.getRole() || '').toLowerCase();
  if (allowedRoles.length > 0 && allowedRoles.includes(role)) {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
}

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return buildRoleAccessDecision(getAllowedRolesFromRoute(route), state.url);
};

export const roleChildGuard: CanActivateChildFn = (
  childRoute: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return buildRoleAccessDecision(getAllowedRolesFromRoute(childRoute), state.url);
};

export const roleMatchGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const attemptedUrl = `/${segments.map(segment => segment.path).join('/')}`;
  const targetUrl = attemptedUrl === '/' ? `/${route.path || ''}` : attemptedUrl;
  return buildRoleAccessDecision(getAllowedRolesFromRoute(route), targetUrl);
};
