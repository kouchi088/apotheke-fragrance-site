import { getSupabaseAdminClient } from '@/lib/adminAuth';

const columnCache = new Map<string, Set<string>>();

export async function getTableColumns(tableName: string): Promise<Set<string>> {
  if (columnCache.has(tableName)) return columnCache.get(tableName)!;

  const db = getSupabaseAdminClient();
  const { data, error } = await db
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_schema', 'public')
    .eq('table_name', tableName);

  if (error) throw error;

  const columns = new Set((data ?? []).map((row: any) => row.column_name as string));
  columnCache.set(tableName, columns);
  return columns;
}

export function pickExistingColumns(payload: Record<string, unknown>, columns: Set<string>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (columns.has(k)) out[k] = v;
  }
  return out;
}
