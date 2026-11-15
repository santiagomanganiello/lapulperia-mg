import { expect, test } from '@playwright/test';

// Rutas públicas con su <h1> esperado. Si una página queda en blanco o cambia
// el encabezado principal, el smoke falla.
const paginas = [
  { ruta: '/', h1: 'La Pulpería MG' },
  { ruta: '/carta', h1: 'Carta de La Pulpería MG' },
  { ruta: '/eventos', h1: 'Próximos eventos' },
  { ruta: '/fotos', h1: 'Fotos' },
  { ruta: '/location', h1: 'Dónde estamos' },
];

test.describe('páginas públicas', () => {
  for (const pagina of paginas) {
    test(`${pagina.ruta} carga con su contenido`, async ({ page }) => {
      const errores: string[] = [];
      page.on('pageerror', (error) => errores.push(error.message));

      const response = await page.goto(pagina.ruta);

      expect(response?.status()).toBe(200);
      await expect(page.locator('main h1')).toHaveText(pagina.h1);
      await expect(page.locator('main')).toBeVisible();
      expect(errores).toEqual([]);
    });
  }

  test('una ruta inexistente muestra el 404', async ({ page }) => {
    const response = await page.goto('/esta-pagina-no-existe');

    expect(response?.status()).toBe(404);
    await expect(page.locator('main h1')).toHaveText('No encontramos esa página');
  });
});

test('los enlaces del menú responden sin 404', async ({ request }) => {
  const rutas = ['/', '/carta', '/eventos', '/fotos', '/location'];

  for (const ruta of rutas) {
    const response = await request.get(ruta);
    expect(response.status(), `GET ${ruta}`).toBe(200);
  }
});
