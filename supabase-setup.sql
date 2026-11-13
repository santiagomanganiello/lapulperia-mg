-- ============================================================
-- Configuración de Supabase para el panel de administración
-- Ejecutá este script en el SQL Editor de tu proyecto Supabase.
-- Es idempotente: se puede correr más de una vez sin romper nada.
-- ============================================================

-- 1) Políticas RLS para la tabla "events" -------------------

alter table events enable row level security;

-- El público (visitantes de la web) solo puede ver eventos publicados.
drop policy if exists "eventos_publicos_lectura" on events;
create policy "eventos_publicos_lectura"
    on events for select
    to anon, authenticated
    using (published = true);

-- El admin (usuario autenticado) puede ver todos los eventos, incluso borradores.
drop policy if exists "admin_ve_todos_los_eventos" on events;
create policy "admin_ve_todos_los_eventos"
    on events for select
    to authenticated
    using (true);

-- El admin puede crear eventos.
drop policy if exists "admin_crea_eventos" on events;
create policy "admin_crea_eventos"
    on events for insert
    to authenticated
    with check (true);

-- El admin puede editar eventos.
drop policy if exists "admin_edita_eventos" on events;
create policy "admin_edita_eventos"
    on events for update
    to authenticated
    using (true)
    with check (true);

-- El admin puede borrar eventos.
drop policy if exists "admin_borra_eventos" on events;
create policy "admin_borra_eventos"
    on events for delete
    to authenticated
    using (true);

-- 2) Bucket público para los flyers --------------------------

insert into storage.buckets (id, name, public)
values ('flyers-pulpe', 'flyers-pulpe', true)
on conflict (id) do nothing;

-- Cualquiera puede ver los flyers (son imágenes públicas de la web).
drop policy if exists "flyers_lectura_publica" on storage.objects;
create policy "flyers_lectura_publica"
    on storage.objects for select
    to anon, authenticated
    using (bucket_id = 'flyers-pulpe');

-- El admin puede subir flyers.
drop policy if exists "admin_sube_flyers" on storage.objects;
create policy "admin_sube_flyers"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'flyers-pulpe');

-- El admin puede borrar flyers.
drop policy if exists "admin_borra_flyers" on storage.objects;
create policy "admin_borra_flyers"
    on storage.objects for delete
    to authenticated
    using (bucket_id = 'flyers-pulpe');

-- 3) Crear el usuario administrador --------------------------
-- Esto NO se hace con SQL: en el panel de Supabase andá a
-- Authentication → Users → "Add user" y creá un usuario con
-- email y contraseña (marcá "Auto Confirm User").
-- Con ese email y contraseña entrás en /admin/login.
