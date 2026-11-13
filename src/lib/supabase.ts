import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';

const missing = [
  !supabaseUrl ? 'PUBLIC_SUPABASE_URL' : null,
  !supabaseKey ? 'PUBLIC_SUPABASE_ANON_KEY' : null,
].filter((name): name is string => Boolean(name));

/** `true` cuando las dos variables públicas están definidas. */
export const isSupabaseConfigured = missing.length === 0;

/**
 * Mensaje accionable para mostrar en el panel cuando falta configuración.
 * Sin esto, `createClient` falla con un error técnico difícil de interpretar.
 */
export const supabaseConfigError = isSupabaseConfigured
  ? null
  : `Falta${missing.length === 1 ? '' : 'n'} ${missing.join(' y ')}. ` +
    'Copiá .env.example a .env, completá los datos del proyecto de Supabase ' +
    '(Project Settings → API) y reiniciá el servidor. ' +
    'Si estás en Vercel, cargalas en Settings → Environment Variables y volvé a deployar.';

// Con la configuración incompleta se crea un cliente inerte: nunca se usa,
// porque cada página que lo consume consulta `isSupabaseConfigured` primero.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-anon-key'
);
