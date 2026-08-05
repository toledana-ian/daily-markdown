import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { getUtcDayBounds, hashApiKey, isValidDateParam } from '../_shared/api-key-crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });

const extractBearerToken = (request: Request): string | null => {
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return null;
  const token = authorization.slice('Bearer '.length).trim();
  return token || null;
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'Server configuration error' }, 500);
  }

  const rawKey = extractBearerToken(request);
  if (!rawKey) {
    return jsonResponse({ error: 'Missing or invalid Authorization header' }, 401);
  }

  const url = new URL(request.url);
  const date = url.searchParams.get('date');
  if (!date) {
    return jsonResponse({ error: 'Missing required date query parameter (YYYY-MM-DD)' }, 400);
  }

  if (!isValidDateParam(date)) {
    return jsonResponse({ error: 'Invalid date parameter. Expected YYYY-MM-DD' }, 400);
  }

  const keyHash = await hashApiKey(rawKey);
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: apiKey, error: apiKeyError } = await supabase
    .from('api_keys')
    .select('id, user_id, expires_at')
    .eq('key_hash', keyHash)
    .maybeSingle();

  if (apiKeyError) {
    return jsonResponse({ error: 'Failed to validate API key' }, 500);
  }

  if (!apiKey) {
    return jsonResponse({ error: 'Invalid API key' }, 401);
  }

  if (new Date(apiKey.expires_at).getTime() < Date.now()) {
    return jsonResponse({ error: 'API key has expired' }, 401);
  }

  const { start, end } = getUtcDayBounds(date);

  const { data: notes, error: notesError } = await supabase
    .from('notes')
    .select('id, content, is_pinned, created_at, updated_at')
    .eq('user_id', apiKey.user_id)
    .gte('created_at', start)
    .lte('created_at', end)
    .order('is_pinned', { ascending: true })
    .order('created_at', { ascending: false });

  if (notesError) {
    return jsonResponse({ error: 'Failed to load notes' }, 500);
  }

  return jsonResponse({
    date,
    notes: (notes ?? []).map((note) => ({
      id: note.id,
      content: note.content,
      isPinned: note.is_pinned,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
    })),
  });
});
