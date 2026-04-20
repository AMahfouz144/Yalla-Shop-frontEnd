import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // Domains that should NOT receive the JWT Authorization header
  private readonly externalDomains = ['api.stripe.com'];

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Skip auth header for external APIs (Stripe, etc.)
    const isExternal = this.externalDomains.some(d => req.url.includes(d));
    if (isExternal) {
      return next.handle(req);
    }

    const token =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('token')
        : null;
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }
    return next.handle(req);
  }
}
