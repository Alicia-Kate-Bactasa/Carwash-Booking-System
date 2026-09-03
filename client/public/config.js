/**
 * Client environment configuration for Montage Auto Studio.
 * Sets the base backend API endpoint accessed by the frontend application.
 *
 * This uses a same-origin relative path so the app works wherever the SPA is
 * served — in development the Vite dev server proxies /api to the backend, and
 * in production the Express server serves the built SPA alongside the /api/v1
 * routes. For a split deployment (SPA hosted separately from the API), replace
 * this with the absolute API origin instead.
 */

// Base URL for backend API requests (relative/same-origin)
window.API_BASE_URL = "/api/v1";
