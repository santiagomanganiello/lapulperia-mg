# La Pulpería MG — Bitácora técnica

**Fase 0 → Fase 3.5 · 13 de noviembre de 2026**

Sitio web del bar **La Pulpería MG** (Monte Grande, Buenos Aires): carta, agenda de eventos, fotos, ubicación y un panel para que el dueño publique fechas sin tocar código.

- **Demo:** https://lapulperia-mg.vercel.app/
- **Repo:** https://github.com/santiagomanganiello/lapulperia-mg
- **Stack:** Astro 7 · Tailwind CSS 4 · Supabase · Vercel

---

## 1. Cronología de cambios

### Fase 0 — Base del proyecto

- 7 fotos convertidas de ~110 MB a ~10 MB (WebP, 2400 px, calidad 90). Los originales quedan fuera del repo.
- `.env.example`, `.gitignore`, `.gitattributes` (LF entre Windows y Linux), README y `docs/arquitectura.md`.
- Sitemap con `/admin` excluido.
- Deploy en Vercel y repo en GitHub.
- Commit `5a6f6b1`.

### Fase 1 — Sitio público

- `src/lib/site.ts`: datos del bar centralizados (dirección, WhatsApp, Instagram). Cambiar ahí se refleja en toda la web.
- `src/lib/hours.ts`: horarios con turnos que **cruzan medianoche**.
- `Layout.astro` nuevo: meta tags, Open Graph, JSON-LD `BarOrPub`, skip link y botón flotante de WhatsApp.
- Componentes `Hours` y `Footer`, hero con foto, `/location` reescrita y 404 propio.
- Badges relativos ("Hoy", "Mañana", "En 3 días") y exportación a calendario `.ics`.
- Commits `ba6f9a3` y `afec580`.

### Fase 2 — Panel usable por el dueño

- **Flyers**: se redimensionan a 1600 px y se convierten a WebP **en el navegador** antes de subirse. Informa el antes/después (ej. 8,4 MB → 210 KB), respeta la orientación EXIF y explica el error con fotos HEIC.
- **Duplicar** evento como borrador, con protección para no borrar un flyer compartido.
- **Borrar** con diálogo propio (reemplaza el `confirm()` del navegador).
- **Exportar CSV** sin dependencias (BOM + `;` para Excel en español).
- **Guard de Supabase**: si faltan variables, el panel muestra qué configurar y la web degrada sin romperse.
- Manual para el dueño: `docs/manual-admin.md`.
- `astro check` + TypeScript y script `npm run check`.
- Commit `af2991c`.

### Corrección de dirección

- Las coordenadas estaban **~240 m al oeste**: salían del centro del iframe de Google, no del marcador.
- Verificadas con tres fuentes independientes (OSM, Photon, ArcGIS): `-34.817899, -58.473892`.
- Los links de "Cómo llegar" y el mapa ahora usan **la dirección en texto**, no el pin.
- Código postal `B1842ABH` agregado al JSON-LD.
- Commit `41eec8d`.

### Fase 3 — Calidad (bloque 1)

- **3.7** CSS: ruta de fuente corregida (`/fonts/...`), `@font-face` válido, paleta movida a tokens de `@theme`. Commit `fefe380`.
- **3.9** Dependabot semanal para npm y GitHub Actions. Commit `350e298`.
- **3.2** Prettier + ESLint + EditorConfig, scripts `lint`/`format`, `zod` eliminado. Commits `356e053` y `4053c2e`.
- **3.3** Vitest con **55 tests** de horarios, fechas y `.ics`. El generador se extrajo a `src/lib/calendar.ts`. Commit `76e925a`.
- **3.5** GitHub Actions: `npm ci → check → lint → format:check → test → build`. Commits `b41895d` y `c31036b`.
- Extra: TypeScript volvió a 6 porque el PR #2 de Dependabot lo había subido a 7, incompatible con `@astrojs/check`.

---

## 2. Conceptos clave

### 2.1 Formas de renderizar en Astro

| Modo                | Qué hace                                                      | Dónde se usa                         |
| ------------------- | ------------------------------------------------------------- | ------------------------------------ |
| **Estático**        | El HTML se genera en el build y se sirve desde el CDN         | `/`, `/carta`, `/fotos`, `/location` |
| **On-demand + ISR** | Se genera al pedirlo y se revalida cada 60 s                  | `/eventos`                           |
| **Server island**   | La página es estática, pero un componente se renderiza aparte | Tarjeta "próximo evento" de la home  |

**Por qué:** la home no puede depender de una consulta a la base para responder. La agenda sí cambia seguido, pero no necesita un deploy: ISR la regenera sola.

**ISR** (Incremental Static Regeneration) = "estático que se actualiza solo". Es el motivo por el que se eligió Vercel: Cloudflare Pages no lo tiene.

### 2.2 Supabase y el modelo de seguridad

- **Postgres** para los eventos, **Auth** para el login del panel y **Storage** para los flyers.
- La **anon key** viaja en el navegador. No es un secreto: el acceso lo decide **RLS** (Row Level Security) en la base.
- `anon` solo lee eventos con `published = true`; solo un usuario autenticado puede crear, editar o borrar.
- El panel no está linkeado en la web pública y usa `noindex`.

### 2.3 Horarios y zonas horarias

- Las fechas se guardan en **UTC** y se muestran siempre en `America/Argentina/Buenos_Aires`.
- Los turnos se guardan en **minutos desde la medianoche del día en que abren**. Cerrar a las 03:00 es `1620` minutos (27 × 60), no `180`.
- Así, a la 01:00 del jueves el sistema entiende que sigue abierto **por el turno del miércoles**.
- Ese cálculo es la parte más frágil del sitio y por eso es la más testeada.

### 2.4 Imágenes y peso

- Las fotos fuente se guardan a 2400 px y se convierten a WebP **antes** de entrar al repo (los originales quedan en `originals/`, ignorado por git).
- Los flyers se optimizan en el navegador del dueño: se achican a 1600 px, se convierten a WebP y recién ahí se suben. Una foto de celular no llega cruda al sitio.
- Se respeta la orientación EXIF para que las fotos verticales no salgan acostadas.

### 2.5 Calendario `.ics`

- Es el formato estándar (iCalendar, RFC 5545) que entienden Google Calendar, Apple y Outlook.
- Las fechas van en UTC compacto (`20261113T023000Z`), los caracteres especiales se escapan y el modelo asume **3 horas** de duración porque no guarda hora de fin.
- Vive en `src/lib/calendar.ts` (no dentro de la ruta) para poder testearlo sin Supabase.

### 2.6 CSV compatible con Excel

- Se agrega **BOM** (marca de UTF-8) y se separa con **punto y coma** para que Excel en español abra las columnas directamente, sin asistente de importación.
- Se hace a mano para no sumar una dependencia: son 30 líneas.

### 2.7 Variables de entorno y degradación

- `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` se cargan en `.env` en local y en Vercel en producción.
- Si faltan, `isSupabaseConfigured` lo detecta: el panel muestra una pantalla de configuración y la web pública sigue funcionando sin agenda.
- Gracias a eso, el CI puede compilar **sin secretos**.

### 2.8 Tipos, lint y formato (no son lo mismo)

| Herramienta                    | Pregunta que responde           | Ejemplo                                                  |
| ------------------------------ | ------------------------------- | -------------------------------------------------------- |
| **TypeScript / `astro check`** | ¿Los datos están bien usados?   | Acceder a `status.opensAt` cuando el estado es "abierto" |
| **ESLint**                     | ¿Hay código sospechoso?         | Una variable que se asigna y nunca se usa                |
| **Prettier**                   | ¿Está prolijo?                  | Espacios, comillas, saltos de línea                      |
| **EditorConfig**               | ¿El editor respeta esas reglas? | LF y 2 espacios al guardar                               |

### 2.9 Tests: unitarios vs end-to-end

- **Unitarios (Vitest):** llaman a una función con casos conocidos. Milisegundos, sin navegador. Cubren 55 casos.
- **E2E (Playwright, pendiente):** abren un navegador real y hacen clic. Detectan páginas en blanco, enlaces rotos y errores de JavaScript.
- No se testean textos ni HTML: cambian seguido y no dan señal.
- Los tests se validaron con una **mutación**: al cambiar a propósito el cierre del jueves, 2 tests fallaron. Si no fallaban, no servían.

### 2.10 CI/CD: dos robots independientes

```
git push ──┬──> GitHub Actions  (calidad: tipos, lint, tests, build)
           └──> Vercel          (deploy del sitio)
```

- **Actions** corre en cada push a `main` y en cada pull request.
- **Vercel** deploya en paralelo y **no espera** al CI.
- Verde significa que compila y que los tests pasan; **no** significa que se vea bien ni que funcione en un celular.
- Si un run falla, el commit ya está subido y el sitio probablemente ya se deployó. Es un semáforo, no un guardia.
- Para que bloquee de verdad habría que activar una _ruleset_ que exija PR + check verde.

### 2.11 Dependabot y dependencias entre paquetes

- Dependabot abre un PR por actualización; nunca mergea solo.
- **Patch/minor**: mergear si está verde. **Major**: leer release notes, porque puede romper una **peer dependency** (lo que otro paquete exige de esa versión).
- El caso TypeScript 7 es el ejemplo: el proyecto compilaba, pero `@astrojs/check` solo acepta `^5 || ^6`, así que instalar fallaba.
- Se agregó un `ignore` para majors de TypeScript hasta que el checker los soporte.

### 2.12 SEO y accesibilidad

- **JSON-LD** `BarOrPub` con dirección, coordenadas, horarios, Instagram y `hasMap` para que Google entienda el negocio.
- **Open Graph** para que el link se vea bien al compartirlo por WhatsApp/Instagram.
- **Sitemap** automático, `/admin` excluido.
- **A11y** (ya hecho): skip link, `<main>`, `alt` en fotos, `aria-label` en el menú, foco visible.
- **Pendiente (3.6):** `prefers-reduced-motion`, contraste fino y cierre del lightbox con teclado.

---

## 3. Decisiones y por qué

| Decisión                                 | Motivo                                                                                |
| ---------------------------------------- | ------------------------------------------------------------------------------------- |
| Vercel y no Cloudflare                   | Cloudflare no tiene ISR; migrar solo si el bar va a producción y conviene el costo    |
| ISR y no SSR total                       | Menos consultas a la base y mejor velocidad; 60 s de delay es irrelevante para un bar |
| Server island en la home                 | La home queda estática y solo la tarjeta del evento se pide aparte                    |
| Varias páginas y no one-page             | Cada sección es compartible por link; mejor SEO                                       |
| WhatsApp solo para delivery              | No existe teléfono de reservas; el número real es de pedidos                          |
| Links por dirección y no por coordenadas | Si Google mueve el pin, los links siguen funcionando                                  |
| CSV a mano                               | Evita una dependencia para algo que son 30 líneas                                     |
| Imágenes convertidas y no un script      | Menos superficie de mantenimiento en el repo                                          |

---

## 4. Estado actual

**Hecho:** Fase 0, Fase 1, Fase 2 y el bloque 1 de la Fase 3 (3.1, 3.2, 3.3, 3.5, 3.7, 3.9).

**CI:** verde en `main` sobre el commit `87fc8e7`.

**Dependabot:** se mergearon los 3 PR abiertos (astro 7.4.8, actions/checkout 7, actions/setup-node 7). No quedan PRs pendientes.

**Pendiente:**

- 3.4 — Playwright (smoke E2E).
- 3.6 — pasada de accesibilidad.
- 3.8 — screenshots en el README (las imágenes ya están en `docs/screenshots/`).
- 2.5 — probar el admin en un celular real.
- 2.6 — video de 3 minutos para el dueño.
- Fase 4 — pitch: propuesta de 1 página, QR, antes/después, métricas, cuentas y soporte.

---

## 5. Comandos útiles

| Comando                                          | Acción                       |
| ------------------------------------------------ | ---------------------------- |
| `npm run dev`                                    | Servidor en `localhost:4321` |
| `npm run build`                                  | Build de producción          |
| `npm run check`                                  | Tipos                        |
| `npm run lint`                                   | ESLint                       |
| `npm test`                                       | 55 tests unitarios           |
| `npm run format:check`                           | Verifica formato             |
| `npm run format`                                 | Aplica formato               |
| `npx astro dev --background` / `stop` / `status` | Manejo del dev server        |

---

## 6. Glosario rápido

- **Commit:** foto de los cambios, con mensaje.
- **Push:** subir los commits a GitHub.
- **PR (pull request):** propuesta de cambio que se revisa antes de entrar a `main`.
- **CI:** robot que corre chequeos en cada push/PR.
- **Build:** proceso que convierte el código en el sitio que se publica.
- **Deploy:** publicar ese build en internet.
- **Lockfile:** archivo que fija las versiones exactas de las dependencias.
- **Peer dependency:** versión que un paquete exige de otro para convivir.
- **RLS:** reglas de la base que deciden quién puede leer o escribir cada fila.
- **ISR:** página estática que se regenera sola cada cierto tiempo.

---

## 7. Incidentes y aprendizajes

1. **Coordenadas corridas 240 m.** El `pb=` del iframe de Google es el centro de la vista, no el marcador. Se resolvió verificando con tres geocoders y usando la dirección en los links.
2. **TypeScript 7 mergeado sin red.** Dependabot no validó las peer dependencies. Ahora el CI lo detecta y hay un `ignore` para ese major.
3. **Carpeta `screnshots`.** Se subió con typo al repo; se renombró a `screenshots` en un commit aparte.
4. **`npm ci` bloqueado por VS Code.** El editor tenía tomado un binario nativo de Astro; se resolvió deteniendo el dev server.
