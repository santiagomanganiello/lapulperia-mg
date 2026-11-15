import { defineConfig, devices } from '@playwright/test';

// Smoke E2E: no reemplaza a los tests unitarios, detecta páginas en blanco,
// enlaces rotos y errores de JavaScript que el build no ve.
//
// Se corre contra `astro dev` porque el adaptador de Vercel no permite
// `astro preview` (ver README). El build de producción ya lo valida el CI aparte.
const PORT = 4321;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { ...process.env, DISABLE_DEV_TOOLBAR: 'true' },
  },
});
