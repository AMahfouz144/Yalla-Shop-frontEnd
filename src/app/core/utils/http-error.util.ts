import { HttpErrorResponse } from '@angular/common/http';

/** Maps ASP.NET ValidationProblemDetails, ProblemDetails, or plain bodies to a single message. */
export function formatHttpError(err: unknown, fallback: string): string {
  if (!(err instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (err.status === 0) {
    return `${fallback} (network — is the API running and CORS allowed?)`;
  }

  if (err.status === 500) {
    return `${fallback} (server error 500 — check API logs / database migrations.)`;
  }

  const body = err.error;
  if (body == null) {
    return err.message || fallback;
  }
  if (typeof body === 'string') {
    return body || fallback;
  }
  if (typeof body === 'object') {
    const o = body as Record<string, unknown>;
    if (typeof o['message'] === 'string' && o['message']) {
      return o['message'] as string;
    }
    if (typeof o['title'] === 'string' && o['title']) {
      return o['title'] as string;
    }
    const errors = o['errors'];
    if (errors && typeof errors === 'object') {
      const parts: string[] = [];
      for (const v of Object.values(errors as Record<string, unknown>)) {
        if (Array.isArray(v)) {
          parts.push(...v.map(x => String(x)));
        } else if (v != null) {
          parts.push(String(v));
        }
      }
      if (parts.length) {
        return parts.join(' ');
      }
    }
  }

  return fallback;
}
