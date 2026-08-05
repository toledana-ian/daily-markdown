import { supabase } from '@/lib/supabase/client.ts';
import { useAuthStore } from '@/features/auth/store/auth.ts';
import { generateApiKeyToken, getApiKeyPrefix, hashApiKey } from '@/features/api-keys/lib/api-key-crypto.ts';
import { useCallback, useEffect, useState } from 'react';

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiKeyRow {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateApiKeyInput {
  name: string;
  expiresAt: string;
}

export interface UpdateApiKeyInput {
  name: string;
  expiresAt: string;
}

const mapApiKey = (row: ApiKeyRow): ApiKey => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  keyPrefix: row.key_prefix,
  expiresAt: row.expires_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const useApiKeys = () => {
  const session = useAuthStore((state) => state.session);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadApiKeys = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('api_keys')
      .select('id, user_id, name, key_prefix, expires_at, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setIsLoading(false);
      return;
    }

    setApiKeys((data ?? []).map(mapApiKey));
    setIsLoading(false);
  }, [session?.user?.id]);

  useEffect(() => {
    Promise.resolve().then(loadApiKeys);
  }, [loadApiKeys]);

  const createApiKey = useCallback(
    async (input: CreateApiKeyInput): Promise<{ apiKey: ApiKey; rawKey: string } | null> => {
      const userId = session?.user?.id;
      if (!userId) return null;

      const rawKey = generateApiKeyToken();
      const keyHash = await hashApiKey(rawKey);
      const keyPrefix = getApiKeyPrefix(rawKey);

      const { data, error: insertError } = await supabase
        .from('api_keys')
        .insert({
          user_id: userId,
          name: input.name.trim(),
          key_hash: keyHash,
          key_prefix: keyPrefix,
          expires_at: input.expiresAt,
        })
        .select('id, user_id, name, key_prefix, expires_at, created_at, updated_at')
        .single();

      if (insertError || !data) {
        setError(insertError?.message ?? 'Failed to create API key');
        return null;
      }

      const apiKey = mapApiKey(data);
      setApiKeys((current) => [apiKey, ...current]);
      setError(null);

      return { apiKey, rawKey };
    },
    [session?.user?.id],
  );

  const updateApiKey = useCallback(
    async (id: string, input: UpdateApiKeyInput): Promise<boolean> => {
      const userId = session?.user?.id;
      if (!userId) return false;

      const { data, error: updateError } = await supabase
        .from('api_keys')
        .update({
          name: input.name.trim(),
          expires_at: input.expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select('id, user_id, name, key_prefix, expires_at, created_at, updated_at')
        .single();

      if (updateError || !data) {
        setError(updateError?.message ?? 'Failed to update API key');
        return false;
      }

      const updated = mapApiKey(data);
      setApiKeys((current) => current.map((key) => (key.id === id ? updated : key)));
      setError(null);
      return true;
    },
    [session?.user?.id],
  );

  const deleteApiKey = useCallback(
    async (id: string): Promise<boolean> => {
      const userId = session?.user?.id;
      if (!userId) return false;

      const previous = apiKeys;
      setApiKeys((current) => current.filter((key) => key.id !== id));

      const { error: deleteError } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (deleteError) {
        setApiKeys(previous);
        setError(deleteError.message);
        return false;
      }

      setError(null);
      return true;
    },
    [apiKeys, session?.user?.id],
  );

  return {
    apiKeys,
    isLoading,
    error,
    loadApiKeys,
    createApiKey,
    updateApiKey,
    deleteApiKey,
  };
};
