/**
 * Proxy del servidor de desarrollo: todo lo que empiece por /api se reenvía al backend.
 * - Local (sin Docker): http://localhost:8000
 * - Docker Compose:     http://app:8000 (variable API_PROXY_TARGET en docker-compose.yml)
 */
module.exports = {
  '/api': {
    target: process.env.API_PROXY_TARGET || 'http://localhost:8000',
    secure: false,
    changeOrigin: true,
  },
};
