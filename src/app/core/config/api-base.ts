/**
 * Deployed API host (Swagger: https://yallashop-api.runasp.net/swagger/index.html).
 * Change `API_HOST` only to target another environment.
 */
export const API_HOST = 'https://yallashop-api.runasp.net';

/** Base URL for JSON endpoints — no trailing slash. */
export const API_BASE_URL = `${API_HOST}/api`;

/** Same host without `/api` — product image URLs under `/UploadedPhotos/...`. */
export const API_ORIGIN = API_HOST;

/** OpenAPI / Swagger for this deployment. */
export const API_SWAGGER_URL = `${API_HOST}/swagger/index.html`;
