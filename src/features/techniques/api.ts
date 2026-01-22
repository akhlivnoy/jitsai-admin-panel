import { supabase } from '../../lib/supabaseClient';

export type Technique = {
  id: string;
  name: string;
  aliases?: string[] | null;
  category?: string | null;
  category_name?: string | null;
  description?: string | null;
  history?: string | null;
  modern_usage?: string | null;
  created_at?: string;
};

export type TechniqueMutationType = 'insert' | 'update' | 'remove';

export type InsertPayload = {
  name: string;
  aliases?: string[] | null;
  category?: string | null;
  category_name?: string | null;
  description?: string | null;
  history?: string | null;
  modern_usage?: string | null;
};

export type UpdatePayload = Partial<InsertPayload> & {
  id: string;
};

export type RemovePayload = {
  id: string;
};

export type MutationPayload = InsertPayload | UpdatePayload | RemovePayload;

export const PAGE_SIZE = 20;

export async function searchTechniques(
  searchText: string = '',
  category: string | null = null,
  limit: number = PAGE_SIZE,
  offset: number = 0,
) {
  const { data, error } = await supabase.rpc('search_techniques', {
    p_search: searchText,
    p_category: category,
    p_limit: limit,
    p_offset: offset,
  });
  if (error) throw error;
  return (data ?? []) as Technique[];
}

export async function callTechniquesAdmin(type: TechniqueMutationType, payload?: MutationPayload) {
  const { error } = await supabase.functions.invoke('techniques-admin', {
    body: { type, payload },
  });
  if (error) throw error;
}
