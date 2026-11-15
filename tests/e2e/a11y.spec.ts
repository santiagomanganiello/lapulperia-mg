import { expect, test } from '@playwright/test';

test('el primer Tab lleva al enlace de salto', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('Tab');

  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
});

test('la galería de fotos se usa con teclado', async ({ page }) => {
  await page.goto('/fotos');

  const fotos = page.locator('[data-foto]');
  const total = await fotos.count();
  const primera = page.getByRole('button', { name: `Ampliar foto 1 de ${total}` });
  const dialog = page.getByRole('dialog', { name: 'Galería de fotos' });
  const contador = page.locator('[data-contador]');

  await primera.focus();
  await page.keyboard.press('Enter');

  await expect(dialog).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cerrar' })).toBeFocused();
  await expect(contador).toHaveText(`1 / ${total}`);

  await page.keyboard.press('ArrowRight');
  await expect(contador).toHaveText(`2 / ${total}`);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  // El foco vuelve a la foto que abrió el visor.
  await expect(primera).toBeFocused();
});

test('la carta ampliada se cierra con Escape', async ({ page }) => {
  await page.goto('/carta');

  const total = await page.locator('[data-slide]').count();
  const primera = page.getByRole('button', { name: `Ampliar página 1 de ${total}` });
  const dialog = page.getByRole('dialog', { name: 'Vista ampliada de la carta' });

  await primera.focus();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(primera).toBeFocused();
});

test.describe('menú mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('se abre y se cierra con Escape', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('[data-menu-toggle]');
    const menu = page.locator('[data-menu]');

    await expect(menu).toBeHidden();
    await expect(toggle).toHaveAccessibleName('Abrir menú');

    await toggle.click();

    await expect(toggle).toHaveAccessibleName('Cerrar menú');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(menu).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(menu).toBeHidden();
    await expect(toggle).toHaveAccessibleName('Abrir menú');
    await expect(toggle).toBeFocused();
  });
});
