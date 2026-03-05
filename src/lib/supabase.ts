import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback to a valid-looking URL to prevent initialization crash, 
// but the app will still fail on actual requests if not configured.
const validUrl = supabaseUrl && supabaseUrl.startsWith('http') 
  ? supabaseUrl 
  : 'https://placeholder-please-configure-supabase.supabase.co';

const validKey = supabaseAnonKey || 'placeholder-key';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ ERROR: Credenciales de Supabase no encontradas.');
  console.info('Asegúrate de configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en las variables de entorno.');
}

export const supabase = createClient(validUrl, validKey);
