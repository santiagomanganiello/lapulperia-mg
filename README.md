# La Pulpería MG

Sitio web del bar **La Pulpería MG**: carta, agenda de eventos, fotos y ubicación, con un panel de administración para publicar fechas sin tocar código.

Demo: _pendiente de deploy_

## Stack

- **Astro 7** — páginas estáticas + rutas on-demand.
- **Tailwind CSS 4** — estilos.
- **Supabase** — base de datos de eventos, storage de flyers y autenticación del panel.
- **Vercel** — deploy, con ISR en la página de eventos.

## Arquitectura

| Ruta | Renderizado | Motivo |
|---|---|---|
| `/`, `/carta`, `/fotos`, `/location` | Estático (prerender) | Contenido que cambia poco: máxima velocidad. |
| `/eventos` | On-demand + **ISR (60 s)** | Lee de Supabase y se revalida cada minuto sin redeploy. |
| `NextEvent` (home) | **Server island** (`server:defer`) | La home sigue estática y solo la tarjeta del próximo evento se pide aparte. |
| `/admin`, `/admin/login` | Estático | Shell protegido por Supabase Auth; los datos, por RLS. |

Decisiones y por qué: ver [`docs/arquitectura.md`](docs/arquitectura.md).

## Cómo correrlo

```bash
npm install
cp .env.example .env   # completar con las claves de Supabase
npm run dev
```

Queda en `http://localhost:4321`.

> `npm run preview` no funciona con el adaptador de Vercel. Para ver el sitio en local usá `astro dev`.

### Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `PUBLIC_SUPABASE_URL` | Sí | URL del proyecto Supabase. |
| `PUBLIC_SUPABASE_ANON_KEY` | Sí | Clave pública (publishable). Es segura en el cliente: el acceso lo controla RLS. |
| `SITE_URL` | No | Dominio público. Si no está, se usa el de `astro.config.mjs`. |

### Base de datos

Ejecutar [`supabase-setup.sql`](supabase-setup.sql) en el SQL Editor de Supabase. Crea las políticas RLS, el bucket `flyers-pulpe` y deja listo el alta del usuario administrador (se crea desde el panel de Supabase, no por SQL).

## Scripts

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo en `localhost:4321`. |
| `npm run build` | Build de producción (`.vercel/output`). |
| `npm run astro ...` | CLI de Astro. |

## Estructura

```text
src/
├── assets/          imágenes fuente (optimizadas en build)
├── components/      NavBar, NextEvent, PhotoGallery, CartaVirtual, Location
├── layouts/         Layout público y AdminLayout
├── lib/             cliente de Supabase y utilidades de fechas
├── pages/           rutas del sitio y del admin
└── styles/          Tailwind + tipografía
supabase-setup.sql   esquema, políticas y bucket
```

## Panel de administración

`/admin` permite crear, editar, publicar y borrar eventos, y subir el flyer a Supabase Storage. Se entra con un usuario de Supabase Auth (`/admin/login`).

## Créditos

Código escrito para este proyecto. Las fotos, el logo y la identidad visual son propiedad de **La Pulpería MG** y se usan con autorización de sus dueños.
