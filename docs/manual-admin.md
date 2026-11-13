# Manual del panel — La Pulpería MG

Guía corta para cargar fechas sin tocar código.

## Entrar

1. Abrí `https://lapulperia-mg.vercel.app/admin` en el celular o en la compu.
2. Ingresá con el email y la contraseña del usuario administrador.
3. Si ya tenías la sesión abierta, entrás directo.

> El panel no está linkeado en la web pública: solo se llega escribiendo `/admin`.

## Crear un evento

1. Tocá **+ Nuevo evento**.
2. Completá:
   - **Título** (obligatorio): lo que se ve grande, por ejemplo «Noche de rock».
   - **Artista / Banda** (obligatorio).
   - **Descripción** (opcional): detalles de la noche.
   - **Fecha** y **Hora** (obligatorias): la hora es la de inicio del evento.
   - **Flyer** (opcional): subí una imagen o pegá una URL.
   - **Información de entradas** (opcional): precio, dónde conseguirlas, etc.
3. Marcá **Publicado** si querés que aparezca en la web.
4. Tocá **Crear evento**.

El evento aparece en **Eventos** y, si está publicado, en la web pública. La agenda se actualiza sola en menos de un minuto.

### Sobre el flyer

- Podés subir una foto o un diseño desde el celular.
- La imagen **se optimiza sola** antes de subir: se achica a 1600 px y se convierte a WebP. Una foto de 8 MB puede quedar en 200 KB.
- Conviene un flyer **vertical** (proporción 4:5 o 9:16); se recorta para llenar la tarjeta.
- Si el celular guarda las fotos en formato **HEIC** y no sube, convertila a JPG o sacá la foto con la opción «Más compatible».

## Publicar, despublicar y editar

Cada evento tiene botones a la derecha:

| Botón                      | Qué hace                                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Publicar / Despublicar** | Muestra u oculta el evento en la web, sin borrarlo.                                                                  |
| **Editar**                 | Abre el formulario con todos los datos cargados.                                                                     |
| **Duplicar**               | Crea una copia del evento (queda como **borrador**). Sirve para repetir una noche fija: cambiás la fecha y publicás. |
| **Borrar**                 | Elimina el evento y su flyer. Pide confirmación y no se puede deshacer.                                              |

Los eventos con fecha pasada se marcan como **Pasado** y dejan de aparecer en la agenda pública automáticamente. No hace falta borrarlos.

## Exportar la lista

El botón **Exportar CSV** descarga todos los eventos (publicados y borradores) en un archivo que abre Excel o Google Sheets. Sirve para tener un respaldo o para llevar el historial.

## Problemas comunes

| Problema                        | Solución                                                                                                                    |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Publiqué un evento y no aparece | Verificá que tenga **Publicado** marcado. La agenda puede tardar hasta 1 minuto en actualizarse.                            |
| No puedo entrar                 | Revisá el email y la contraseña. Si la olvidaste, se resetea desde el panel de Supabase (Authentication → Users).           |
| No sube el flyer                | Probá con una imagen JPG o PNG. Si sigue, pegá una URL en el campo de imagen o revisá el bucket `flyers-pulpe` en Supabase. |
| El sitio no carga o tarda       | El plan gratuito de Supabase se pausa por inactividad. Entrá al panel de Supabase y reactivá el proyecto.                   |
| Borré un evento sin querer      | No se puede recuperar desde el panel. Si tenés un CSV exportado, quedan los datos (no las imágenes).                        |

## Buenas prácticas

- Cargá las fechas con al menos una semana de anticipación.
- Revisá el texto desde el celular: la mayoría de las visitas llegan por Instagram.
- Usá el botón **Duplicar** para las noches fijas y cambiá solo la fecha.
- Exportá un CSV una vez por mes como respaldo.
