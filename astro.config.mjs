// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
    // Cambiar por el dominio propio cuando esté definido (o setear SITE_URL).
    site: process.env.SITE_URL || 'https://lapulperia-mg.vercel.app',
    integrations: [
        sitemap({
            // El panel no va en el sitemap (además ya tiene noindex).
            filter: (page) => !page.includes('/admin'),
        }),
    ],
    vite: {
        plugins: [tailwindcss()],
    },
    // La página de eventos se renderiza on-demand y Vercel la cachea con ISR.
    // El resto del sitio sigue siendo estático.
    adapter: vercel({
        isr: {
            expiration: 60,
        },
    }),
});
