# Arquitectura

Documento corto con las decisiones de diseño y sus motivos. El objetivo es que cualquiera pueda entender **por qué** está armado así, no solo cómo.

## Renderizado por ruta

| Ruta | Modo | Motivo |
|---|---|---|
| `/` | Estático | Es la puerta de entrada; no puede depender de una consulta a la base para responder. |
| `/carta`, `/fotos`, `/location` | Estático | Contenido versionado en el repo, cambia poco. |
| `/eventos` | On-demand + ISR 60 s | La agenda cambia seguido y no debe requerir un deploy. |
| `NextEvent` | Server island | La home queda estática y solo esta tarjeta se renderiza en el servidor, con su propio cache. |
| `/admin` | Estático (shell) | La sesión y los datos se resuelven en el cliente contra Supabase. |

## Por qué ISR y no SSR total

Renderizar todo on-demand habría sido más simple de escribir, pero castiga la velocidad y el costo: cada visita paga una consulta a la base. Con ISR la página se genera una vez y se sirve desde el CDN; si pasó más de un minuto, se regenera en segundo plano.

Consecuencia asumida: un evento publicado puede tardar hasta 60 s en aparecer. Para un bar, es irrelevante.

## Por qué un server island en la home

La home es estática, pero "el próximo evento" es lo único que cambia. En vez de volver dinámica toda la página, se usa `server:defer`: el HTML estático se sirve al instante con un skeleton y la tarjeta se reemplaza cuando llega su respuesta.

Además la isla manda `Cache-Control: s-maxage=60, stale-while-revalidate=300`, así que el CDN la cachea y Supabase recibe una consulta por minuto como máximo, no una por visita.

## Por qué RLS y no un backend propio

La clave pública de Supabase viaja en el bundle del navegador. Eso no es un problema: el acceso lo define Row Level Security en la base.

- `anon` solo puede leer eventos con `published = true`.
- Solo un usuario autenticado puede crear, editar o borrar.
- El bucket de flyers es de lectura pública y escritura autenticada.

Con eso, el panel puede ser 100 % cliente sin necesidad de una API intermedia ni de exponer una `service_role` key.

## Tiempo y zonas horarias

Las fechas se guardan en UTC y se muestran siempre en `America/Argentina/Buenos_Aires`. El formateo vive en un único módulo (`src/lib/events.ts`) para que la web pública, la isla y la agenda no se desincronicen.

## Limitaciones conocidas

- **Sin backend para el panel**: la protección es RLS + `noindex`. Es adecuado para este caso, pero no reemplaza una sesión verificada del lado del servidor.
- **Supabase free** se pausa por inactividad; si el sitio queda sin tráfico una semana, la primera visita puede fallar.
- **Imágenes fuente**: se guardan a 2400 px; los originales quedan fuera del repo.
- **Flyers**: se optimizan en el navegador (máx. 1600 px, WebP) antes de subirlos. El panel no valida el peso máximo del bucket; una imagen que el navegador no pueda decodificar (HEIC en algunos casos) muestra un error explicativo.
