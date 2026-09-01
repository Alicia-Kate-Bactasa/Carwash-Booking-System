/**
 * Client environment configuration for Montage Auto Studio.
 * Sets the base backend API endpoint accessed by the frontend application.
 *
 * For local development: "http://localhost:5001/api/v1"
 * For live web deployment: leave as empty string "" or your live server API URL (e.g., "/api/v1" or "https://your-api-domain.com/api/v1")
 */

window.API_BASE_URL = window.location.origin.includes('localhost')
  ? "http://localhost:5001/api/v1"
  : "/api/v1";
